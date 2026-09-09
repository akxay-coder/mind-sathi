# Security Specification: Health Matrix Firestore Hardening

## 1. Data Invariants
1. **User Identity & Role Immutability**: A user cannot assign themselves an elevated role (`admin` or `counsellor`) upon self-registration. Role changes are restricted to existing authorized admins or empanelled officers.
2. **Check-In Ownership**: Daily check-ins can only be created with `userId == request.auth.uid`. A user cannot forge another beneficiary's check-in or tamper with other users' check-ins.
3. **Counsellor Interventions**: Clinical intervention notes can only be authored by authenticated counsellors or admins. Complainants cannot forge intervention records.
4. **Case Protection**: Beneficiary case details (legal status, compensation info) can only be read by the designated complainant (`resource.data.complainantId == request.auth.uid`) or authorized counsellors/admins. Case updates are restricted to counsellors/admins.
5. **Alert State Integrity**: Alerts can be updated by counsellors/admins only to change status (`Open`, `Under Review`, `Resolved`) and resolution notes.
6. **Chat Isolation**: Saathi chat companion messages belong strictly to the authenticated user (`userId == request.auth.uid`). Users cannot view or delete another user's chat logs.
7. **Denial-of-Wallet Guards**: All strings and collections must have explicit size and length bounds to block malicious payload exhaustion attacks.

---

## 2. The "Dirty Dozen" Malicious Payloads

1. **Self-Promotion Exploit (`/users/{uid}`)**:
   ```json
   { "userId": "attacker_123", "name": "Attacker", "role": "admin" }
   ```
   *Expected Result*: PERMISSION_DENIED (Cannot elevate role on write without admin credentials).

2. **Ghost Field Shadow Injection (`/checkins/{id}`)**:
   ```json
   { "userId": "user_1", "mood": "okay", "energyLevel": 3, "sleepQuality": "fair", "isSystemOverride": true, "counsellorId": "hacked" }
   ```
   *Expected Result*: PERMISSION_DENIED (Exceeds defined schema / unauthorized keys).

3. **Check-In Identity Spoofing (`/checkins/{id}`)**:
   ```json
   { "userId": "victim_uid", "mood": "very_low", "energyLevel": 1, "sleepQuality": "poor" }
   ```
   *Expected Result*: PERMISSION_DENIED (Incoming `userId` does not match `request.auth.uid`).

4. **Resource Exhaustion String Bomb (`/checkins/{id}`)**:
   ```json
   { "userId": "user_1", "mood": "okay", "energyLevel": 3, "sleepQuality": "fair", "notes": "A".repeat(50000) }
   ```
   *Expected Result*: PERMISSION_DENIED (String exceeds 1,000 character maximum limit).

5. **Arbitrary Array Flooding (`/checkins/{id}`)**:
   ```json
   { "userId": "user_1", "mood": "okay", "energyLevel": 3, "sleepQuality": "fair", "tags": Array(200).fill("spam") }
   ```
   *Expected Result*: PERMISSION_DENIED (Array size exceeds 10 items limit).

6. **Unauthenticated Check-In Injection (`/checkins/{id}`)**:
   *Request*: No `request.auth` token.
   *Expected Result*: PERMISSION_DENIED (`request.auth != null` invariant violated).

7. **Complainant Modifying Case Compensation (`/cases/{caseId}`)**:
   ```json
   { "compensationStatus": { "totalEligible": "₹ 10,00,00,000" } }
   ```
   *Expected Result*: PERMISSION_DENIED (Complainants have read-only access to case files; write is reserved for counsellors/admins).

8. **Non-Owner Reading Confidential Profile (`/users/{otherUid}`)**:
   *Request*: Authenticated as `user_A` attempting to `get` `/users/user_B`.
   *Expected Result*: PERMISSION_DENIED (Strict PII isolation: only `isOwner()` or `isCounsellorOrAdmin()` permitted).

9. **Forged Intervention Note by Beneficiary (`/interventions/{id}`)**:
   ```json
   { "caseId": "c-842", "counsellorName": "Faked Counsellor", "note": "All charges dropped." }
   ```
   *Expected Result*: PERMISSION_DENIED (Beneficiary role cannot author clinical interventions).

10. **Tampering with Alert Severity After Resolution (`/alerts/{id}`)**:
    ```json
    { "severity": "Low", "caseId": "altered_case" }
    ```
    *Expected Result*: PERMISSION_DENIED (Only `status` and `resolutionNotes` keys are allowed during alert update).

11. **Chat Privacy Breach (`/chat_messages/{id}`)**:
    *Request*: `user_B` querying `/chat_messages` where `userId == 'user_A'`.
    *Expected Result*: PERMISSION_DENIED (Rule requires `resource.data.userId == request.auth.uid`).

12. **Unverified Email Privilege Escalation**:
    *Request*: Auth token with `email == "akshaypiano@gmail.com"` but `email_verified == false`.
    *Expected Result*: PERMISSION_DENIED (Admin rule mandates `request.auth.token.email_verified == true`).
