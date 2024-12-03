pinentry-program /opt/homebrew/bin/pinentry-mac

allow-loopback-pinentry

# Increase timeouts
default-cache-ttl 34560000
max-cache-ttl 34560000

export GPG_TTY=$(tty)
