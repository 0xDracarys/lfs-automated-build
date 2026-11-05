# Check-DemoHealth.ps1 — maintained verification for the WSL demo guest.
# Runs the promised run-sheet checks (thesis-demo-runsheet.md) against a named
# guest and exits 0 only if all pass. Usage:
#   .\Check-DemoHealth.ps1 -Guest LFS-Goal-Test6
param([Parameter(Mandatory=$true)][string]$Guest)
$ErrorActionPreference = 'Continue'
$script:pass = 0; $script:fail = 0; $script:failed = @()
function Say([string]$m) { Write-Host $m }
function Ok([string]$m) { $script:pass++; Say "PASS: $m" }
function Bad([string]$m) { $script:fail++; $script:failed += $m; Say "FAIL: $m" }
# Run a script inside the guest via stdin (avoids wsl.exe quote mangling).
# PowerShell appends CR only to the final piped line, so every probe ends with
# a harmless echo that absorbs it; all real lines arrive clean.
function Guest([string]$Script) {
  $full = $Script + "`necho HEALTH-DONE"
  $out = $full | wsl -d $Guest -u root --exec bash --login -s 2>&1
  return ($out -join "`n")
}
function Has([string]$Out, [string]$Re) { return $Out -match $Re }

Say "guest=$Guest date=$(Get-Date -Format 'yyyy-MM-dd HH:mm')"
$state = (wsl --list --verbose 2>&1 | ForEach-Object { $_ -replace "`0",'' } | Select-String -Pattern $Guest) -join ' '
Say "state: $state"

# 1. banner on login entry
$b = Guest 'echo BANNER-PROBE'
if (Has $b 'Dracarys') { Ok 'banner on login entry' } else { Bad 'banner on login entry' }

# 2+3. root + filesystem
$r = Guest 'whoami; id; ls /'
if ((Has $r '(?m)^root\r?$') -and (Has $r 'uid=0\(root\)')) { Ok 'root shell' } else { Bad 'root shell' }
if ((Has $r 'build-logs') -and (Has $r 'lost\+found')) { Ok 'LFS filesystem' } else { Bad 'LFS filesystem' }

# 4. LFS triplets
$t = Guest '/bin/bash --version | head -1; gcc --version | head -1; gcc -dumpmachine'
if (Has $t 'x86_64-lfs-linux-gnu') { Ok 'bash/gcc LFS triplets' } else { Bad 'bash/gcc LFS triplets' }

# 5. compile + link + run
$c = Guest "echo 'int main(void){return 0;}' | gcc -xc -o /tmp/hc - && /tmp/hc && echo LINK-RUN-OK; rm -f /tmp/hc"
if (Has $c 'LINK-RUN-OK') { Ok 'compile-link-run' } else { Bad 'compile-link-run' }

# 6. tools + locale
$l = Guest 'for t in mount ps free top ss ip ping ssh; do command -v $t >/dev/null && echo "HAVE $t"; done; locale -a'
$haveCount = ([regex]::Matches($l, 'HAVE ')).Count
if (($haveCount -eq 8) -and (Has $l 'C\.UTF-8')) { Ok 'tools + C.UTF-8 locale' } else { Bad "tools + locale (have=$haveCount)" }

# 7. practice targets
$v = Guest 'curl -s -o /dev/null -w "juice:%{http_code}\n" --max-time 8 http://127.0.0.1:3000/; curl -s -o /dev/null -w "dvwa:%{http_code}\n" --max-time 8 http://127.0.0.1:80/; curl -s -o /dev/null -w "webgoat:%{http_code}\n" --max-time 8 http://127.0.0.1:8080/WebGoat/; curl -s -o /dev/null -w "webwolf:%{http_code}\n" --max-time 8 http://127.0.0.1:9090/WebWolf/; (exec 3<>/dev/tcp/127.0.0.1/3307) 2>/dev/null && echo mariadb:UP'
foreach ($kv in @('juice:200','dvwa:302','webgoat:302','webwolf:302','mariadb:UP')) {
  if (Has $v $kv) { Ok $kv } else { Bad $kv }
}

# 7b. reachable from Windows itself (browser path through the WSL relay)
foreach ($spec in @(@('win-juice','http://127.0.0.1:3000/','200'),@('win-dvwa','http://127.0.0.1:80/','302'),@('win-webgoat','http://127.0.0.1:8080/WebGoat/','302'),@('win-webwolf','http://127.0.0.1:9090/WebWolf/','302'))) {
  $code = [string](curl.exe -s -o NUL -w '%{http_code}' --max-time 10 $spec[1] 2>$null)
  if ($code -eq $spec[2]) { Ok "$($spec[0]):$code" } else { Bad "$($spec[0]) (want $($spec[2]), got '$code')" }
}
foreach ($p in @(3307,22)) {
  $c = New-Object Net.Sockets.TcpClient
  try { $c.Connect('127.0.0.1', $p); Ok "win-tcp:$p OPEN" } catch { Bad "win-tcp:$p CLOSED" } finally { $c.Close() }
}

# 7c. git can clone over https (offline-safe: helper must exist)
$g = Guest 'test -x "$(git --exec-path)/git-remote-https" && echo GIT-HTTPS-OK'
if (Has $g 'GIT-HTTPS-OK') { Ok 'git https helper' } else { Bad 'git https helper' }

# 7d. DVWA login flow works end to end (needs seeded DB + working PHP+MySQL)
$dl = Guest 'rm -f /tmp/hcj; curl -s -b /tmp/hcj -c /tmp/hcj -o /tmp/hl.html --max-time 10 http://127.0.0.1:80/login.php; T=$(grep -o "user_token'' value=''[^'']*''" /tmp/hl.html | head -1 | sed "s/.*value=''//;s/''//"); curl -s -b /tmp/hcj -c /tmp/hcj --data-urlencode "username=admin" --data-urlencode "password=password" --data-urlencode "Login=Login" --data-urlencode "user_token=$T" -o /dev/null -w "auth:%{http_code} %{redirect_url}\n" --max-time 10 http://127.0.0.1:80/login.php; curl -s -b /tmp/hcj -o /tmp/hh.html --max-time 10 http://127.0.0.1:80/index.php; grep -q "Welcome to Damn Vulnerable" /tmp/hh.html && echo DVWA-AUTH-OK'
if (Has $dl 'DVWA-AUTH-OK') { Ok 'dvwa login flow' } else { Bad 'dvwa login flow' }

# 8. kernel honesty
$u = Guest 'uname -r'
if (Has $u 'microsoft-standard-WSL2') { Ok 'WSL2 host kernel' } else { Bad 'WSL2 host kernel' }

Say "summary: pass=$($script:pass) fail=$($script:fail)"
if ($script:fail -gt 0) { Say ("failed: " + ($script:failed -join ', ')); exit 1 }
exit 0
