# LFS Banner — Future Fix Plan (PROPOSAL ONLY — NOT APPLIED)

> **STATUS: DO NOT APPLY WITHOUT APPROVAL.**
> Written 2026-10-21, before the thesis defense meeting. Nothing in this plan has been
> executed. This document is the *only* output of this work item. No build was started,
> no WSL distribution was touched, no cloud call was made, no commit was made.

---

## Goal (in plain words)

Every **future** root filesystem produced by the build should greet the user with a
banner when they open a shell as root:

```text
╔══════════════════════════════════════════════════╗
║              MY LINUX FROM SCRATCH               ║
║              LFS Thesis Environment              ║
╚══════════════════════════════════════════════════╝

User:     root
System:   LFS userland
Shell:    GNU Bash <version>
Compiler: GCC <version>
```

The customization must live **inside the build output itself** (seeded at build time
into `/etc` and `/root`), not be applied by hand to one distro.

---

## Why it doesn't happen today (inspection findings, verified 2026-10-21)

| # | Finding | Evidence |
|---|---------|----------|
| 1 | The main builder **already seeds** a welcome experience into the rootfs | `lfs-build.sh` lines 638–706 (section titled *Step 3: Custom LFS Welcome Experience*): writes `/etc/lfs-welcome.sh`, `/etc/profile`, `/root/.bashrc`, `/usr/bin/help` into `${LFS_MNT}` |
| 2 | But a **WSL interactive shell never shows it** | WSL starts bash as a **non-login** shell → only `/root/.bashrc` runs → and today `.bashrc` does **not** source the banner. `/etc/profile` (which does) is skipped. This is the single key gap. |
| 3 | The existing banner content is wrong for the thesis | It is an ASCII penguin saying *"Cloud-Built Custom System"*, *"Sam's LFS Pipeline"*, *"Google Cloud Run (8 vCPU)"* — outdated, host-specific claims |
| 4 | The June-era rootfs flow writes **none** of these files | `build-minimal-bootable.sh` (436 lines) creates the tree, builds 17 packages, and ends without any banner/profile/bashrc seeding — this is why imported distros show a bare prompt today |
| 5 | No `/etc/motd` is created anywhere in the repo | Verified by grep across all `*.sh` |

**Packaging is already safe:** `package-lfs-outputs.sh` tars the whole `${LFS}` tree
wholesale, so anything we add to `/etc` and `/root` automatically ships inside every
future artifact. No packaging change is needed.

**Cloud container is already safe:** `Dockerfile.cloudrun` copies `lfs-build.sh`
(line 40) and `build-minimal-bootable.sh` (line 44) into the image — so changes kept
*inside these two scripts* reach cloud builds with **zero Dockerfile changes**.
(Therefore this plan deliberately avoids creating a new standalone seed script.)

---

## Change A — `lfs-build.sh` (one section, lines 638–706)

Three small edits, all inside the existing *Step 3* section. The build's other steps
are untouched; these edits only add/replace text files inside the generated rootfs.

### A1. Replace the banner render inside the embedded heredoc

**Location:** the `cat > "${LFS_MNT}/etc/lfs-welcome.sh" << 'WELCOME_EOF'` block,
lines 639–682.

**What to change:** replace the ASCII-penguin art block (today lines 644–652) with the
thesis box + dynamic identity lines, and add a tiny guard so the banner prints at most
once per shell and only on real terminal screens. The neofetch info-table, memory/CPU
lines and color palette are **removed** in this draft (they can be re-added below the
box later if wanted).

**Proposed full replacement heredoc (paste-ready):**

```bash
    # --- Welcome banner (thesis box, dynamic lines) ---
    cat > "${LFS_MNT}/etc/lfs-welcome.sh" << 'WELCOME_EOF'
#!/bin/bash
# LFS thesis banner - sourced from /root/.bashrc and /etc/profile on interactive shells.
case $- in *i*) ;; *) return ;; esac          # only real interactive shells
[ -n "$LFS_BANNER_SHOWN" ] && return          # never print twice in one session
export LFS_BANNER_SHOWN=1

echo ""
printf '╔══════════════════════════════════════════════════╗\n'
printf '║              MY LINUX FROM SCRATCH               ║\n'
printf '║              LFS Thesis Environment              ║\n'
printf '╚══════════════════════════════════════════════════╝\n'
echo ""
echo "User:     $(id -un 2>/dev/null || echo root)"
echo "System:   LFS userland"
echo "Shell:    GNU Bash $(bash --version 2>/dev/null | head -1 | sed 's/.*version //' | cut -d' ' -f1 || echo '?')"
echo "Compiler: GCC $(gcc --version 2>/dev/null | head -1 | sed 's/.*) //' || echo 'not available')"
echo ""
echo "Type help to see available commands."
echo ""
WELCOME_EOF
    chmod 644 "${LFS_MNT}/etc/lfs-welcome.sh"
```

Notes:
- Versions are **dynamic** (read at login time with `bash --version` / `gcc --version`)
  so the banner never lies about the system it runs on.
- No Windows-specific paths anywhere — pure POSIX shell only.
- `id -un` prints the real logged-in user (root today, works for any user).

### A2. The critical WSL fix — make `/root/.bashrc` show the banner

**Location:** the `cat > "${LFS_MNT}/root/.bashrc" << 'BASHRC_EOF'` block, today
lines 698–706.

**What to change:** append exactly two things at the end of the heredoc (after the
`alias cls='clear'` line):

```bash
if [ -f /etc/lfs-welcome.sh ]; then
  source /etc/lfs-welcome.sh
fi
```

This one edit is what lets ordinary `wsl -d <distro>` sessions (non-login shells)
display the banner. Today those shells show nothing.

### A3. New file — `/etc/motd`

**Location:** insert immediately after the `.bashrc` heredoc block (after today's
line 706, before the `help` command section at line 708).

**What to change:** add a short static message-of-the-day (a plain text file;

```bash
    # --- /etc/motd (static box; dynamic details come from the banner script) ---
    cat > "${LFS_MNT}/etc/motd" << 'MOTD_EOF'
╔══════════════════════════════════════════════════╗
║              MY LINUX FROM SCRATCH               ║
║              LFS Thesis Environment              ║
╚══════════════════════════════════════════════════╝

LFS userland.   Type help  for the command list.
MOTD_EOF
```

`/etc/motd` is intentionally static (it is read verbatim at traditional logins);
the dynamic User/Bash/GCC lines live in the banner script, which `/etc/profile`
already sources for login shells.

---

## Change B — `build-minimal-bootable.sh` (one block near the end)

**Location:** the June-era rootfs creator, 436 lines total. Insert one block right
**after** GCC Pass-2 installation (`ln -sv gcc $LFS/usr/bin/cc`) and **before** the
final `"MINIMAL BOOTABLE BUILD COMPLETE!"` log banner (the `log "====...=="` line that
precedes it, today around line 408–412).

**Why:** today this script produces a rootfs with **no** profile/bashrc/motd at all
(root cause of the bare prompt in imported distros). Adding the same seed block keeps
both build flows (orchestrator and standalone minimal) producing consistent shells.

**Proposed block (paste-ready; same banner content as Change A1):**

```bash
# ============================================================
# Seed shell welcome (banner, profile, bashrc, motd) into rootfs
# ============================================================
log "Installing welcome banner and shell environment..."
mkdir -p "$LFS/etc" "$LFS/root"

cat > "$LFS/etc/lfs-welcome.sh" << 'WELCOME_EOF'
# (identical banner body to Change A1 — the guarded thesis box with the
#  dynamic User / System / Shell / Compiler lines)
WELCOME_EOF

cat > "$LFS/etc/motd" << 'MOTD_EOF'
# (identical static box to Change A3)
MOTD_EOF

cat > "$LFS/etc/profile" << 'PROFILE_EOF'
export PATH=/usr/bin:/usr/sbin:/bin:/sbin
export PS1='\[\033[1;36m\]lfs\[\033[0m\]:\[\033[1;34m\]\w\[\033[0m\]\$ '
export TERM=xterm-256color
export LANG=C
export HOME=/root
cd /root
if [ -f /etc/lfs-welcome.sh ]; then source /etc/lfs-welcome.sh; fi
PROFILE_EOF

cat > "$LFS/root/.bashrc" << 'BASHRC_EOF'
export PS1='\[\033[1;36m\]lfs\[\033[0m\]:\[\033[1;34m\]\w\[\033[0m\]\$ '
export PATH=/usr/bin:/usr/sbin:/bin:/sbin
export TERM=xterm-256color
alias ll='ls -la --color=auto'
alias la='ls -A --color=auto'
alias l='ls -CF --color=auto'
if [ -f /etc/lfs-welcome.sh ]; then source /etc/lfs-welcome.sh; fi
BASHRC_EOF
```

(In the real file the `WELCOME_EOF`/`MOTD_EOF` heredocs are expanded exactly as in
Change A1/A3 — the placeholders above are only to avoid duplicating them in this
report.)

---

## What is deliberately NOT part of this plan

- Not touching `lfs-welcome.sh` at repo root (unfinished orphan helper, not wired into any build).
- Not touching `build-lfs-complete-local.sh` (Chapter-5-only toolchain test script; produces `lfs-toolchain-local.tar.gz`, not a final rootfs).
- Not touching the Dockerfile, the packager, existing WSL distributions, `LFS-Fixed`, or the Git repo.
- No rebuild is required for existing artifacts; this plan changes only *future* outputs.

## Risks

- **Build risk: none.** Both edits only write three text files into the generated tree.
  If a heredoc is mispositioned, the only symptom would be missing/mangled dotfiles in
  the rootfs — detected immediately by the acceptance test below.
- **Cosmetic risk: low.** If a terminal cannot render the box-drawing characters
  (╔ ═ ║ ╚), the banner prints slightly ragged. A pure-ASCII fallback banner is a one-line
  variant and can be chosen instead — say so when applying.

## Acceptance test (safe, later, with approval)

1. Apply A+B (only edits: `lfs-build.sh`, `build-minimal-bootable.sh`).
2. Run one test build (e.g. the minimal bootable flow) — **requires approval, this plan does not run it**.
3. Package and import the produced tar into a **throwaway** WSL distro name (no overwrite).
4. `wsl -d <new-distro> -u root` → the box banner with dynamic Bash/GCC versions is visible.
5. `exit` — nothing else modified.

## Explicitly unchanged right now

- `lfs-build.sh` — untouched (verified via `git diff --stat` after writing this report)
- `build-minimal-bootable.sh` — untouched (same check)
- All existing WSL distributions including `LFS-Fixed` — untouched
- Git repository — untouched (no adds, no commits)
