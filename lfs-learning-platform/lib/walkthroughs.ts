/**
 * Vuln Hub walkthroughs — one source of truth for the lab guides.
 *
 * Everything here matches what lfs-vulnbox.sh actually ships:
 *   · Juice Shop 20.3.0 (node22 bundle)      → /opt/juice-shop, :3000
 *   · DVWA master (PHP 8.2.13, MariaDB 11.4.5) → /opt/dvwa,     :80
 *   · WebGoat 8.2.2 + WebWolf 8.2.2           → /opt/webgoat,   :8080 / :9090
 *
 * Rules for editing:
 *   · no point values, scores or timings — the apps change them between releases
 *   · no credentials that are not in the launcher output
 *   · where a payload depends on the upstream version, say so instead of guessing
 */

export type Accent = "emerald" | "rose" | "violet";

export interface Step {
  text?: string;
  code?: string;
  note?: string;
}

export interface Exercise {
  title: string;
  category: string;
  goal: string;
  steps: Step[];
  expected: string;
  why: string;
}

export interface Walkthrough {
  slug: string;
  name: string;
  accent: Accent;
  badge: string;
  url: string;
  creds: string;
  intro: string;
  setup: Step[];
  exercises: Exercise[];
  footer?: string;
}

export const WALKTHROUGHS: Walkthrough[] = [
  /* ─────────────────────────── Juice Shop ─────────────────────────── */
  {
    slug: "juice-shop",
    name: "OWASP Juice Shop",
    accent: "emerald",
    badge: "Node.js · port 3000",
    url: "http://localhost:3000/",
    creds: "Register any account. The first registration is not special — the admin account already exists.",
    intro:
      "Juice Shop tracks its own progress on a scoreboard. Each exercise below is one challenge on that board; when it completes, the board marks it. That is your proof, not a screenshot of an alert box.",
    setup: [
      { text: "Start every installed target from inside the VM or WSL distro:" },
      { code: "vulnbox-start" },
      { text: "Open the shop and its scoreboard:" },
      { code: "http://localhost:3000/" },
      { code: "http://localhost:3000/#/scoreboard" },
      {
        text: "To reach it from Windows while it runs in WSL, publish the port through a throwaway HTTPS URL:",
      },
      { code: "vulnbox-tunnel 3000" },
    ],
    exercises: [
      {
        title: "Find the scoreboard",
        category: "Reconnaissance",
        goal: "Reach the challenge scoreboard — it is not linked from the main navigation.",
        steps: [
          { text: "Open the app and click the menu button (☰) in the top-left corner." },
          { text: "Choose Score Board." },
          { code: "http://localhost:3000/#/scoreboard" },
        ],
        expected: "The scoreboard lists every challenge and marks the ones you have solved.",
        why: "Reachable-but-unlinked pages are the first thing a scanner finds. Hiding a page is not access control.",
      },
      {
        title: "Sign in as the administrator",
        category: "OWASP A03 · Injection",
        goal: "Authenticate as admin@juice-sh.op without knowing its password.",
        steps: [
          { text: "Open Login and enter this in the email field:" },
          { code: "' OR 1=1--" },
          { text: "Enter any password and submit." },
          {
            note:
              "If the form rejects the payload, this build has parameterised that query. Use the challenge's own hint rather than guessing further — the point of the exercise is the class of bug, not one magic string.",
          },
        ],
        expected: "You are signed in as the administrator and the scoreboard marks Login Admin as solved.",
        why: "The login query is assembled by string concatenation, so the injected OR makes the WHERE clause true for every row.",
      },
      {
        title: "Read a confidential document",
        category: "OWASP A01 · Broken Access Control",
        goal: "Open a file the application never links to.",
        steps: [
          { text: "Browse to the file server directory:" },
          { code: "http://localhost:3000/ftp/" },
          { text: "Open acquisitions.md." },
        ],
        expected: "The document renders and Access a confidential document completes.",
        why: "A directory listing exposes files that were meant to be unlisted. Unlisted is not protected.",
      },
      {
        title: "Provoke an unhandled error",
        category: "OWASP A05 · Security Misconfiguration",
        goal: "Make the product search fail and leak database detail.",
        steps: [
          { text: "Send an unterminated quote to the search endpoint:" },
          { code: "http://localhost:3000/rest/products/search?q='" },
        ],
        expected: "The API answers 500 and the body contains a SQL error; Error Handling completes.",
        why: "Verbose database errors tell an attacker the engine, the query shape and often the column names.",
      },
      {
        title: "Get script execution in the search page",
        category: "OWASP A03 · Cross-site scripting",
        goal: "Have the search term executed as HTML rather than displayed as text.",
        steps: [
          { text: "Paste this into the search box and press Enter:" },
          { code: '<iframe src="javascript:alert(\'xss\')">' },
          {
            note:
              "Modern browsers increasingly refuse javascript: URLs in an iframe. If nothing fires, open the DOM XSS challenge hint — Juice Shop keeps a payload that works in current browsers.",
          },
        ],
        expected: "The alert fires (or the challenge completes) and DOM XSS is marked solved.",
        why: "The search term is written into the DOM with an HTML sink instead of being escaped as text.",
      },
      {
        title: "Submit a rating the UI does not offer",
        category: "OWASP A04 · Insecure design",
        goal: "Post product feedback with zero stars, which the widget cannot produce.",
        steps: [
          { text: "Open any product and open Developer Tools → Network." },
          { text: "Submit feedback once, then find the POST to /api/Feedbacks in the request list." },
          { text: "Replay the request with the rating set to 0:" },
          { code: '"rating": 0' },
        ],
        expected: "The feedback is stored with zero stars and Zero Stars completes.",
        why: "Validation that exists only in the browser is a suggestion. The server has to enforce the range.",
      },
    ],
    footer:
      "Juice Shop's own hints are the authority on payloads. If a challenge resists, read its hint before changing the app — the point is to learn the bug, not to beat the build.",
  },

  /* ───────────────────────────── DVWA ─────────────────────────────── */
  {
    slug: "dvwa",
    name: "DVWA",
    accent: "rose",
    badge: "PHP + lighttpd · port 80",
    url: "http://localhost/",
    creds: "admin / password — then click “Create / Reset Database” on the setup page.",
    intro:
      "DVWA is a PHP lab with a security dial. Every exercise below assumes the dial is on low, which is the only setting where the payloads are this short. Raising the dial later is the real lesson.",
    setup: [
      { text: "Start the targets. MariaDB initialises on the first boot and takes about a minute:" },
      { code: "vulnbox-start" },
      { text: "Open the app and sign in:" },
      { code: "http://localhost/" },
      { text: "Credentials: admin / password." },
      {
        text: "On the setup page, click Create / Reset Database, then open DVWA Security and set it to low.",
      },
      {
        note:
          "MariaDB listens on 127.0.0.1:3307 inside the guest, not 3306 — Windows frequently owns 3306 through the WSL relay.",
      },
    ],
    exercises: [
      {
        title: "Command injection",
        category: "OWASP A03 · Injection",
        goal: "Run a second command through the ping form.",
        steps: [
          { text: "Open Command Injection and submit this in the IP address field:" },
          { code: "127.0.0.1; id" },
        ],
        expected: "The ping output is followed by the output of id — the web server's user.",
        why: "The form passes input to a shell. A semicolon ends the intended command and starts yours.",
      },
      {
        title: "SQL injection",
        category: "OWASP A03 · Injection",
        goal: "Dump the users table through the ID field.",
        steps: [
          { text: "Open SQL Injection and submit:" },
          { code: "1' UNION SELECT user, password FROM users#" },
          {
            note:
              "The # starts a comment in MariaDB. If the field is wrapped in parentheses, close them before the comment.",
          },
        ],
        expected: "The page lists every username with its password hash.",
        why: "The ID is concatenated into the query, so a UNION appends rows the query was never meant to return.",
      },
      {
        title: "Reflected XSS",
        category: "OWASP A03 · Cross-site scripting",
        goal: "Execute script from the name parameter.",
        steps: [
          { text: "Open XSS (Reflected) and submit this as the name:" },
          { code: "<script>alert('xss')</script>" },
        ],
        expected: "An alert fires and the page echoes the payload back unescaped.",
        why: "Input is reflected into the HTML body without encoding, so the browser treats it as code.",
      },
      {
        title: "Stored XSS",
        category: "OWASP A03 · Cross-site scripting",
        goal: "Persist a payload that runs for every visitor.",
        steps: [
          { text: "Open XSS (Stored) and post this as the message:" },
          { code: "<script>alert(document.cookie)</script>" },
        ],
        expected: "The alert fires now and again on every reload — the payload is in the database.",
        why: "Stored XSS outlives the request. This is the variant that spreads through a comment section.",
      },
      {
        title: "Local file inclusion",
        category: "OWASP A01 · Broken access control",
        goal: "Read a file outside the web root.",
        steps: [
          { text: "Open File Inclusion and request the password file:" },
          { code: "http://localhost/vulnerabilities/fi/?page=../../../../../../etc/passwd" },
        ],
        expected: "The contents of /etc/passwd are rendered in the page.",
        why: "The page parameter is used as a path with no allow-list, so traversal climbs out of the web root.",
      },
      {
        title: "Unrestricted file upload",
        category: "OWASP A04 · Insecure design",
        goal: "Upload a PHP file and have the server execute it.",
        steps: [
          { text: "Save this as proof.php — it prints the host it runs on, nothing more:" },
          { code: "<?php echo 'executed on ' . php_uname(); ?>" },
          { text: "Open File Upload and upload the file." },
          { text: "Request the uploaded file:" },
          { code: "http://localhost/hackable/uploads/proof.php" },
        ],
        expected: "The page prints the system description, proving the upload was executed as code.",
        why: "Only the file extension was checked, and not even that on low. An upload directory that executes is remote code execution.",
      },
      {
        title: "Brute force",
        category: "OWASP A07 · Authentication failures",
        goal: "Recover the admin password by guessing, because nothing rate-limits you.",
        steps: [
          { text: "Open Brute Force. It reports success or failure with no delay and no lockout." },
          {
            text: "Drive the form with Burp Suite Community (Intruder) or any HTTP client, cycling a short wordlist.",
          },
          { note: "The password is password — the exercise is the absence of a limit, not the wordlist." },
        ],
        expected: "The correct password is found and the page reports a successful login.",
        why: "Authentication without rate limiting turns a password into a search problem.",
      },
    ],
    footer:
      "DVWA's security level changes the mitigations, not the application. After low, repeat each exercise on medium and high and note exactly what defeated your payload.",
  },

  /* ──────────────────────────── WebGoat ───────────────────────────── */
  {
    slug: "webgoat",
    name: "WebGoat",
    accent: "violet",
    badge: "Java 17 · port 8080",
    url: "http://localhost:8080/WebGoat/",
    creds: "Self-register on first visit. WebWolf (port 9090) uses the same account.",
    intro:
      "WebGoat teaches by assignment: each lesson states a goal and grades it when you satisfy it. The exercises below are the lessons that map onto the same bug classes as Juice Shop and DVWA, so you can compare three implementations of one problem.",
    setup: [
      { text: "Start the targets. The JVM needs roughly a minute before the app answers:" },
      { code: "vulnbox-start" },
      { text: "Open WebGoat and register an account:" },
      { code: "http://localhost:8080/WebGoat/" },
      { text: "WebWolf, for the lessons that need an attacker-controlled server:" },
      { code: "http://localhost:9090/WebWolf/" },
      {
        note:
          "WebGoat grades each assignment itself. If a payload is rejected, open the lesson's hint — the assignments are version-specific and the hint always matches the shipped jar.",
      },
    ],
    exercises: [
      {
        title: "SQL injection — string concatenation",
        category: "OWASP A03 · Injection",
        goal: "Retrieve every row from a query that was meant to return one person.",
        steps: [
          { text: "Open the SQL Injection (intro) lesson and go to the string-injection assignment." },
          { text: "Submit this as the last name:" },
          { code: "SELECT * FROM user_data WHERE first_name = 'John' AND last_name = '' OR '1'='1'" },
        ],
        expected: "The assignment reports success and shows more rows than the query intended.",
        why: "Same bug as DVWA's SQL injection, written in Java. The OR makes the predicate true regardless of the name.",
      },
      {
        title: "Authentication bypass",
        category: "OWASP A07 · Authentication failures",
        goal: "Log in without a valid password.",
        steps: [
          { text: "Open the Authentication Bypasses lesson and go to the TAN assignment." },
          { text: "Submit this where a TAN is expected:" },
          { code: "' OR 1=1--" },
        ],
        expected: "The assignment reports success — the check was bypassed.",
        why: "The same injection class as the Juice Shop admin login, aimed at a second-factor check instead of a password.",
      },
      {
        title: "Cross-site scripting",
        category: "OWASP A03 · Cross-site scripting",
        goal: "Get script execution in a page other users will load.",
        steps: [
          { text: "Open the Cross Site Scripting lesson and use its comment or search field." },
          { code: "<script>alert('xss')</script>" },
        ],
        expected: "The lesson reports the payload executed.",
        why: "Identical to DVWA's stored XSS. Compare how each framework escapes output — and where it forgets to.",
      },
      {
        title: "Broken access control",
        category: "OWASP A01 · Broken access control",
        goal: "Read another user's data by changing an identifier.",
        steps: [
          { text: "Open the Access Control Flaws lesson and its missing-function-level or IDOR assignment." },
          {
            text: "Intercept the request and change the user identifier to another value, then forward it.",
          },
        ],
        expected: "The response contains data belonging to a different user.",
        why: "The server trusted an identifier supplied by the client. This is the same failure as Juice Shop's confidential document, with a parameter instead of a path.",
      },
      {
        title: "JWT — trusting the client's claims",
        category: "OWASP A02 · Cryptographic failures",
        goal: "Escalate a normal user to an administrator by editing the token.",
        steps: [
          { text: "Open the JWT lesson and capture the token the app issues." },
          { text: "Decode it (the lesson links a decoder) and inspect the claims." },
          {
            text: "Change the admin claim to true, re-sign with the key the lesson provides, and send it back.",
          },
          { note: "The lesson supplies the signing key on purpose — that is the weakness being demonstrated." },
        ],
        expected: "The lesson accepts the forged token and the assignment completes.",
        why: "A JWT is only as trustworthy as the key behind it. A weak or leaked secret makes every claim forgeable.",
      },
      {
        title: "Insecure deserialisation",
        category: "OWASP A08 · Software and data integrity failures",
        goal: "Get the server to act on data it should never have trusted.",
        steps: [
          { text: "Open the Insecure Deserialization lesson." },
          {
            text: "Follow its assignment — the payload is a serialised object, and the lesson explains the gadget chain it relies on.",
          },
        ],
        expected: "The assignment reports success once the crafted object is accepted.",
        why: "Deserialising untrusted input can execute code before any of your validation runs.",
      },
    ],
    footer:
      "WebGoat is the only one of the three with an explicit grading engine. Use it to check your understanding, then reproduce the same bug by hand in Juice Shop or DVWA where nothing tells you whether you were right.",
  },
];

export function getWalkthrough(slug: string): Walkthrough | undefined {
  return WALKTHROUGHS.find((w) => w.slug === slug);
}
