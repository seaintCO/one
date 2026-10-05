# ONE CRM V15 Framer Repair

This build pins Framer Motion's internal `motion-dom` / `motion-utils`
dependencies to compatible versions so npm cannot float to a newer
`motion-dom` version that removed `activeAnimations`.

Recommended clean install:

```powershell
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Remove-Item node_modules -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item package-lock.json -Force -ErrorAction SilentlyContinue
Remove-Item .next -Recurse -Force -ErrorAction SilentlyContinue
npm cache verify
npm install --registry=https://registry.npmjs.org
npm run dev
```
