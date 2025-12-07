export PATH=/usr/bin:/bin:/sbin:/usr/sbin
export HOME=/root
export TERM=xterm-256color
export PS1='\[\033[1;32m\][LFS]\[\033[0m\] \[\033[1;34m\]\w\[\033[0m\] \$ '
export LANG=C.UTF-8
export LC_ALL=C.UTF-8
export EDITOR=nano
export VISUAL=nano

# Aliases
alias ls='ls --color=auto'
alias ll='ls -lh --color=auto'
alias la='ls -lah --color=auto'
alias grep='grep --color=auto'
alias cls='clear'
alias h='history'
alias ..='cd ..'
alias ...='cd ../..'

# Git shortcuts
alias gs='git status'
alias ga='git add'
alias gc='git commit'
alias gp='git push'
alias gl='git log --oneline'

# Show welcome banner
/usr/bin/lfs-welcome
