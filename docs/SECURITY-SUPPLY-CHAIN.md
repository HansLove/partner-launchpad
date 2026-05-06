# Supply-chain malware recovery

This document tracks the malware incident pattern seen in JavaScript config files and the local remediation workflow for this repository.

## What was affected in this repo

- `postcss.config.js`: an obfuscated payload was appended after the legitimate export block.
- `.gitignore`: `.env` handling was weakened and `config.bat` appeared without justification.

## Known malware markers

- `2857687`
- `4573868`
- `global['!']`
- `_$_1e42`

## Cleanup performed

1. Restored `postcss.config.js` to a clean config-only file.
2. Restored `.gitignore` secrets policy:
   - keep `.env` ignored
   - keep `.env.*` ignored
   - keep `!.env.example` tracked
   - removed unexplained `config.bat`
3. Added `scripts/audit-malware-git.js` to scan all local/remote refs.

## Audit command

```bash
node scripts/audit-malware-git.js
```

If protected branches are reported, clean files on those branches and push a clean commit.  
If non-protected branches are reported and no longer needed, delete them and prune:

```bash
git push origin --delete <branch-name>
git fetch --prune
```

## Recovery checklist

1. Audit refs with `node scripts/audit-malware-git.js`.
2. Keep clean files on active/protected branches.
3. Delete unneeded branches that still carry malware markers.
4. Rotate credentials if `.env` may have leaked.
