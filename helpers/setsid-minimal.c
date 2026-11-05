/* setsid-minimal.c — run a program in a new session (detached).
 *
 * Why this exists: util-linux 2.39's --disable-all-programs build offers no
 * switch for setsid, and its setsid.c needs generated config macros, so the
 * 25-line tool is compiled directly. Pure libc, no util-linux headers.
 * Used by the vulnbox launcher: daemons must survive the starter session.
 */
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

int main(int argc, char **argv)
{
    pid_t pid;

    if (argc < 2) {
        fprintf(stderr, "usage: setsid command [args...]\n");
        return 1;
    }
    /* setsid(2) fails for process-group leaders: fork first when needed. */
    if (getpid() == getsid(0)) {
        pid = fork();
        if (pid < 0) {
            perror("fork");
            return 1;
        }
        if (pid > 0)
            _exit(0);
    }
    if (setsid() < 0) {
        perror("setsid");
        return 1;
    }
    execvp(argv[1], &argv[1]);
    perror(argv[1]);
    return 127;
}
