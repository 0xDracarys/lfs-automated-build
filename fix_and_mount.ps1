wsl -d Ubuntu-22.04 -e bash -c "
echo 'Extracting tarball...'
mkdir -p /tmp/lfs-fix
cd /tmp/lfs-fix
sudo rm -rf ./*
sudo tar xzf /mnt/c/Users/jayma/Documents/Bhasker/LFS-cloud/lfs-system.tar.gz

echo 'Fixing symlinks...'
sudo rm -rf bin lib sbin
sudo ln -s usr/bin bin
sudo ln -s usr/lib lib
sudo ln -s usr/sbin sbin

echo 'Creating /etc/wsl.conf for proper boot...'
sudo mkdir -p etc
sudo bash -c 'echo \"[boot]\" > etc/wsl.conf'
sudo bash -c 'echo \"systemd=true\" >> etc/wsl.conf'
sudo bash -c 'echo \"[automount]\" >> etc/wsl.conf'
sudo bash -c 'echo \"enabled=true\" >> etc/wsl.conf'

echo 'Repackaging fixed tarball...'
sudo tar czf /mnt/c/Users/jayma/Documents/Bhasker/LFS-cloud/lfs-system-fixed.tar.gz .
echo 'Done fixing tarball!'
"

Write-Host "Unregistering broken LFS-Cloud..."
wsl --unregister LFS-Cloud 2>

Write-Host "Importing fixed LFS-Cloud..."
wsl --import LFS-Cloud "C:\Users\jayma\Documents\Bhasker\LFS-cloud" "C:\Users\jayma\Documents\Bhasker\LFS-cloud\lfs-system-fixed.tar.gz" --version 2

Write-Host "Done! You can now test it with: wsl -d LFS-Cloud"
