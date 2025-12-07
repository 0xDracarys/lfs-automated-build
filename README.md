# Linux From Scratch - Automated Build System

A complete platform for building Linux From Scratch (LFS 12.0) with an interactive learning frontend.

**Live Site:** https://lfs-by-sam.netlify.app

## Quick Start

### Frontend (Learning Platform)
```bash
cd lfs-learning-platform
npm install
npm run dev
```

### Deploy to Netlify
```bash
cd lfs-learning-platform
netlify deploy --prod
```

---

## Building LFS from Scratch (Linux Machine)

Copy and paste these commands one at a time on a fresh Linux machine (Ubuntu/Debian recommended).

### Prerequisites

```bash
# Install required packages
sudo apt update
sudo apt install -y build-essential bison flex texinfo gawk patch wget xz-utils

# Verify tools
bash --version
gcc --version
make --version
```

### Step 1: Set Up Environment

```bash
# Create LFS directory
export LFS=/mnt/lfs
sudo mkdir -pv $LFS
sudo chown -v $USER $LFS

# Create directory structure
mkdir -pv $LFS/{bin,boot,etc,lib,lib64,sbin,usr,var,tools,sources}
mkdir -pv $LFS/usr/{bin,lib,sbin,include}
chmod -v a+wt $LFS/sources

# Create /tools symlink
sudo ln -sv $LFS/tools /tools
```

### Step 2: Set Environment Variables

```bash
# Add to ~/.bashrc or run directly
export LFS=/mnt/lfs
export LFS_TGT=$(uname -m)-lfs-linux-gnu
export PATH=/tools/bin:/usr/bin:/bin
export MAKEFLAGS="-j$(nproc)"
export LC_ALL=POSIX
```

### Step 3: Download Sources

```bash
cd $LFS/sources

# Core toolchain
wget https://ftp.osuosl.org/pub/lfs/lfs-packages/12.0/binutils-2.41.tar.xz
wget https://ftp.osuosl.org/pub/lfs/lfs-packages/12.0/gcc-13.2.0.tar.xz
wget https://ftp.osuosl.org/pub/lfs/lfs-packages/12.0/linux-6.4.12.tar.xz
wget https://ftp.osuosl.org/pub/lfs/lfs-packages/12.0/glibc-2.38.tar.xz

# GCC prerequisites
wget https://ftp.osuosl.org/pub/lfs/lfs-packages/12.0/mpfr-4.2.0.tar.xz
wget https://ftp.osuosl.org/pub/lfs/lfs-packages/12.0/gmp-6.3.0.tar.xz
wget https://ftp.osuosl.org/pub/lfs/lfs-packages/12.0/mpc-1.3.1.tar.gz
```

### Step 4: Build Binutils (Pass 1)

```bash
cd $LFS/sources
tar -xf binutils-2.41.tar.xz
cd binutils-2.41
mkdir -v build && cd build

../configure \
    --prefix=/tools \
    --with-sysroot=$LFS \
    --target=$LFS_TGT \
    --disable-nls \
    --enable-gprofng=no \
    --disable-werror

make
make install

cd $LFS/sources
rm -rf binutils-2.41
```

### Step 5: Build GCC (Pass 1)

```bash
cd $LFS/sources
tar -xf gcc-13.2.0.tar.xz
cd gcc-13.2.0

# Extract prerequisites
tar -xf ../mpfr-4.2.0.tar.xz && mv mpfr-4.2.0 mpfr
tar -xf ../gmp-6.3.0.tar.xz && mv gmp-6.3.0 gmp
tar -xf ../mpc-1.3.1.tar.gz && mv mpc-1.3.1 mpc

# Fix for x86_64
case $(uname -m) in
  x86_64) sed -e '/m64=/s/lib64/lib/' -i.orig gcc/config/i386/t-linux64 ;;
esac

mkdir -v build && cd build

../configure \
    --target=$LFS_TGT \
    --prefix=/tools \
    --with-glibc-version=2.38 \
    --with-sysroot=$LFS \
    --with-newlib \
    --without-headers \
    --enable-default-pie \
    --enable-default-ssp \
    --disable-nls \
    --disable-shared \
    --disable-multilib \
    --disable-threads \
    --disable-libatomic \
    --disable-libgomp \
    --disable-libquadmath \
    --disable-libssp \
    --disable-libvtv \
    --disable-libstdcxx \
    --enable-languages=c,c++

make
make install

cd ..
cat gcc/limitx.h gcc/glimits.h gcc/limity.h > \
  $(dirname $($LFS_TGT-gcc -print-libgcc-file-name))/install-tools/include/limits.h

cd $LFS/sources
rm -rf gcc-13.2.0
```

### Step 6: Install Linux Headers

```bash
cd $LFS/sources
tar -xf linux-6.4.12.tar.xz
cd linux-6.4.12

make mrproper
make headers
find usr/include -type f ! -name '*.h' -delete
cp -rv usr/include $LFS/usr/

cd $LFS/sources
rm -rf linux-6.4.12
```

### Step 7: Build Glibc

```bash
cd $LFS/sources
tar -xf glibc-2.38.tar.xz
cd glibc-2.38

# Create lib64 symlink for x86_64
case $(uname -m) in
    x86_64) 
        ln -sfv ../lib/ld-linux-x86-64.so.2 $LFS/lib64
        ln -sfv ../lib/ld-linux-x86-64.so.2 $LFS/lib64/ld-lsb-x86-64.so.3
    ;;
esac

mkdir -v build && cd build
echo "rootsbindir=/usr/sbin" > configparms

../configure \
    --prefix=/usr \
    --host=$LFS_TGT \
    --build=$(../scripts/config.guess) \
    --enable-kernel=3.2 \
    --with-headers=$LFS/usr/include \
    libc_cv_slibdir=/lib

make
make DESTDIR=$LFS install
sed '/RTLDLIST=/s@/usr@@g' -i $LFS/usr/bin/ldd

cd $LFS/sources
rm -rf glibc-2.38
```

### Step 8: Build Libstdc++ (GCC)

```bash
cd $LFS/sources
tar -xf gcc-13.2.0.tar.xz
cd gcc-13.2.0
mkdir -v build && cd build

../libstdc++-v3/configure \
    --host=$LFS_TGT \
    --build=$(../config.guess) \
    --prefix=/usr \
    --disable-multilib \
    --disable-nls \
    --disable-libstdcxx-pch \
    --with-gxx-include-dir=/tools/$LFS_TGT/include/c++/13.2.0

make
make DESTDIR=$LFS install
rm -v $LFS/usr/lib/lib{stdc++{,exp,fs},supc++}.la

cd $LFS/sources
rm -rf gcc-13.2.0
```

### Step 9: Verify Toolchain

```bash
echo 'int main(){}' | $LFS_TGT-gcc -xc -
readelf -l a.out | grep ld-linux
rm -v a.out
```

Expected output should show: `/lib64/ld-linux-x86-64.so.2`

---

## Project Structure

```
lfs-automated/
├── lfs-learning-platform/    # Next.js frontend
│   ├── app/                  # App router pages
│   ├── components/           # React components
│   ├── data/                 # Lesson content
│   └── lib/                  # Utilities
├── helpers/                  # Build helper scripts
├── lfs-build.sh             # Main build script
├── lfs-chapter5-real.sh     # Chapter 5 toolchain
└── README.md                # This file
```

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Framer Motion
- **Backend:** Firebase (Auth, Firestore, Functions), Google Vertex AI
- **Deployment:** Netlify (frontend)
- **Cloud Build System:** Coming Soon (Google Cloud Run integration planned)
- **LFS Version:** 12.0 (Kernel 6.4.12)

## License

MIT
