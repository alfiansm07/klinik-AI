# 6. Arsitektur API & Routing

[< Kembali ke Index](./README.md)

---

## Routing Convention

| Tipe | Pattern | Contoh |
|---|---|---|
| **Pages** | `app/<module>/page.tsx` | `app/dashboard/page.tsx` |
| **Nested Pages** | `app/<module>/<sub>/page.tsx` | `app/patients/[id]/page.tsx` |
| **API Routes** | `app/api/<version>/<module>/route.ts` | `app/api/v1/patients/route.ts` |
| **Auth API** | `app/api/auth/[...all]/route.ts` | Better-Auth catch-all |
| **Server Actions** | `app/<module>/actions.ts` | Co-located with pages |

## API Design

**Pendekatan: Server Actions + API Routes**

| Use Case | Pendekatan | Justifikasi |
|---|---|---|
| Form submissions (CRUD) | **Server Actions** | Simpler, progressive enhancement, type-safe |
| Data fetching (read) | **Server Components** | Direct DB access, no API overhead |
| External integrations (future) | **API Routes** (`/api/v1/*`) | REST endpoints for BPJS/SatuSehat bridging |
| Auth operations | **Better-Auth API** (`/api/auth/*`) | Handled by Better-Auth library |
| Real-time (queue display) | **Server-Sent Events** atau polling | Queue status updates for display boards |

## Server Actions Pattern

```typescript
// app/patients/actions.ts
"use server";

import { z } from "zod";
import { db } from "@klinik-AI/db";
import { requireAuth, requireRole } from "@/lib/auth-helpers";

const createPatientSchema = z.object({
  name: z.string().min(1),
  nik: z.string().length(16).optional(),
  dateOfBirth: z.string().date(),
  gender: z.enum(["male", "female"]),
  // ... more fields
});

export async function createPatient(formData: FormData) {
  const session = await requireAuth();
  await requireRole(session, ["admin", "receptionist"]);
  
  const clinicId = session.clinicId;
  const data = createPatientSchema.parse(Object.fromEntries(formData));
  
  // Auto-generate medical record number
  const mrNumber = await generateMRNumber(clinicId);
  
  const patient = await db.insert(patients).values({
    ...data,
    clinicId,
    mrNumber,
  }).returning();
  
  return patient;
}
```

---

## URL Structure (Pages)

```
/                           # Landing / Home
/login                      # Sign In / Sign Up
/dashboard                  # Main Dashboard (per role)

# Master Data
/master/clinic              # Profil Klinik
/master/employees           # SDM & Jadwal
/master/poly                # Poli / Unit Pelayanan
/master/medicines           # Master Obat
/master/actions             # Master Tindakan
/master/tariffs             # Tarif & Komponen

# Front Office
/patients                   # Daftar Pasien
/patients/new               # Pasien Baru
/patients/[id]              # Detail Pasien
/registration               # Pendaftaran Kunjungan
/queue                      # Manajemen Antrean
/queue/display              # Display Antrean (TV/Monitor)

# EMR
/emr                        # Dashboard Poli (daftar pasien menunggu)
/emr/[visitId]              # Detail Rekam Medis (SOAP + Tindakan + E-Resep)

# Farmasi
/pharmacy                   # Antrean Resep
/pharmacy/[prescriptionId]  # Detail Dispensing
/pharmacy/inventory         # Stok Obat
/pharmacy/receiving         # Penerimaan Barang
/pharmacy/stock-opname      # Stok Opname

# Kasir
/cashier                    # Dashboard Tagihan
/cashier/[billingId]        # Proses Pembayaran

# Laporan
/reports                    # Hub Laporan
/reports/visits             # Laporan Kunjungan
/reports/revenue            # Laporan Pendapatan
/reports/pharmacy           # Laporan Farmasi
```
