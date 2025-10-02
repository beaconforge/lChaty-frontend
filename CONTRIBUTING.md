## Contributing — Certificate & Security Workflow

This repository has stricter controls around certificates, keys, and trust store changes.
Follow these steps when you need to modify certificates or security-related scripts.

1) Open an issue titled: "Cert change request: <short description>" and include:
   - The exact files/scripts you intend to change.
   - The rationale and timeline.
   - The approver's GitHub username (must be a project owner/admin).

2) Wait for explicit written approval in the issue comments from the approver.
   - Approval must include the approver's GitHub username and a one-line statement.

3) After approval, update your local environment to allow guarded scripts to run:
   - Either run the PowerShell script with the `-Approved` switch, e.g.:

```powershell
./scripts/generate-dev-certs.ps1 -OutDir ./certs -PfxPassword mypass -Approved
```

   - Or set the environment variable temporarily in the session:

```powershell
$env:CERT_OP_APPROVED='1'
# run the approved script
Remove-Item Env:\CERT_OP_APPROVED
```

4) Create a pull request referencing the issue and include:
   - A clear description of what changed and why.
   - A short security audit note with commands run and who executed them.

5) The PR must be approved by the designated approver before merging.

Notes:
- Never run these actions in CI. Certificate/trust changes are manual and local.
- If you are not an approver, do not attempt to bypass these controls.
- For emergencies, contact a project owner and create an issue documenting the emergency action afterward.