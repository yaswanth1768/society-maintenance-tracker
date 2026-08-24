# System Design Document: Society Maintenance Tracker

## 1. Complaint Lifecycle & Status History Model

The system enforces a deterministic, state-driven lifecycle for all maintenance requests:

```
[Open] ──(Admin Assignment / Action)──► [In Progress] ──(Resolution)──► [Resolved (Closed)]
```

### Data Model & Immutability
- **`Complaint` Entity**: Stores root attributes (`id`, `resident_id`, `category`, `description`, `photo_url`, `priority`, `status`, `created_at`, `updated_at`).
- **`ComplaintHistory` Entity**: Implements an append-only audit trail. Every state transition or administrative remark creates a discrete, immutable history record:
  - `id`: Unique history entry identifier (`H-xxx`).
  - `complaint_id`: Foreign key referencing the parent complaint.
  - `status`: State snapshot (`Open`, `In Progress`, `Resolved`).
  - `actor_id` & `actor_name`: Identifier and display name of the actor executing the change (Resident or Administrator).
  - `note`: Contextual remarks explaining the transition (e.g., technician assigned, parts ordered).
  - `created_at`: ISO 8601 UTC timestamp.

When an issue reaches the `Resolved` state, it is locked as closed, preventing active SLA accumulation while preserving the complete audit history for accountability.

---

## 2. Overdue Detection & SLA Breach Logic

### Dynamic Threshold Calculation
Overdue detection is computed dynamically at query time using the society’s configurable SLA threshold parameter (`overdue_threshold_days`, default: 5 days):

$$\text{Days Open} = \lfloor \frac{\text{Current Time} - \text{Created Date}}{86,400,000 \text{ ms}} \rfloor$$

$$\text{is\_overdue} = (\text{status} \neq \text{'Resolved'}) \land (\text{Days Open} > \text{Threshold})$$

### Priority Ingestion & Sorting
1. **Query-Level Flagging**: The API layer enriches all complaint objects with `days_open` and boolean `is_overdue` flags.
2. **Surfacing at Top of Admin View**: Complaints are sorted using a compound comparator:
   $$\text{Comparator}(A, B) = (\text{is\_overdue}_B - \text{is\_overdue}_A) \parallel (\text{created\_at}_B - \text{created\_at}_A)$$
   This guarantees overdue items always float to the top of the admin table with high-visibility red badges, while maintaining chronological order within each segment.
3. **Threshold Customization**: Administrators can adjust the threshold dynamically in the UI, instantly re-evaluating SLA breach statuses across all unresolved complaints.

---

## 3. Photo Upload Handling

### Architecture & Storage Strategy
To support lightweight prototyping with a seamless transition to cloud object storage:

```
[Resident UI File Input / Drag & Drop] 
        │
        ▼ (Client-side validation: MIME type & size < 5MB)
[FileReader API (Base64 DataURL)] ──► [Stored in Complaint.photo_url]
        │
        ▼ (Production Path)
[Presigned S3 / Cloudinary Upload] ──► [CDN URL stored in DB]
```

1. **Client-side Validation**: Validates MIME types (`image/jpeg`, `image/png`, `image/webp`) and enforces a strict 5 MB file size limit before processing.
2. **Preview & Lightbox**: Provides instant thumbnail preview with a removal option prior to form submission, and an interactive full-screen lightbox modal for administrative inspection.
3. **Storage Abstraction**: In the current deployment, images are processed into base64 Data URLs stored within the complaint document. In a distributed deployment, the client requests a presigned URL from an S3/Cloudinary service, directly uploading the binary and persisting only the immutable CDN URL.

---

## 4. Notification & Email Dispatch Flow

The system employs an event-driven notification architecture ensuring residents remain informed of all lifecycle changes and community alerts:

```
[Trigger Event] (Status Update / Important Notice)
       │
       ├──► 1. In-App Notification Record Created (smt_notifications)
       ├──► 2. Reactive Event Emitted (smt_notification_received) ──► Updates UI Badge
       └──► 3. Transactional Email Dispatcher (Simulated / Free-Tier SMTP / Resend)
```

### Event Triggers
1. **Complaint Status Change**:
   - **Trigger**: Administrator submits a new status (`In Progress`, `Resolved`) with remarks.
   - **Recipient**: The specific resident who lodged the complaint (`complaint.resident_id`).
   - **Payload**: Formatted email containing Complaint ID, new status, assigned team notes, and deep link to the resolution timeline.
2. **Important Society Notice**:
   - **Trigger**: Administrator posts a notice with `is_important = true`.
   - **Recipient**: Broadcast to all active resident accounts.
   - **Payload**: High-priority email containing circular subject, description, and admin signature.

### In-App Notification Center & Free-Tier Integration
- **In-App Hub**: An interactive notification center in the top header features live unread badge counters and a full HTML email viewer displaying `From`, `To`, `Subject`, `Date`, and message body.
- **Provider Support**: Ready for plug-and-play integration with free-tier email services (EmailJS, Resend, or Nodemailer SMTP) via environment configuration.
