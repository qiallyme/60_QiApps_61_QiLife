import type { QiBit, QiRecord } from "../types";
import { formatQiDecimal, emitPipelineEvent } from "./eventPipelineService";
import { qiRecordToQiBit } from "./qiBitMapper";

export interface MigrationResult {
  migratedCount: number;
  skippedCount: number;
  bits: QiBit[];
}

/**
 * Migration Strategy: qilife.records -> qilife.bits (ADR 0005)
 * Safely converts legacy QiRecord entries into universal QiBits with canonical QiDecimal identifiers.
 */
export async function migrateRecordsToBits(records: QiRecord[]): Promise<MigrationResult> {
  const bits: QiBit[] = [];
  let migratedCount = 0;
  let skippedCount = 0;

  for (let index = 0; index < records.length; index += 1) {
    const record = records[index];
    if (!record || !record.id) {
      skippedCount += 1;
      continue;
    }

    const bit = qiRecordToQiBit(record);
    if (!bit.qiDecimal) {
      bit.qiDecimal = formatQiDecimal(bit.type, index + 1);
    }

    // Emit migration event
    await emitPipelineEvent(
      {
        eventType: "bit.captured",
        bitId: bit.id,
        payload: { source: "migration_qilife_records", originalEntityKey: record.entity_key },
      },
      bit,
    );

    bits.push(bit);
    migratedCount += 1;
  }

  return {
    migratedCount,
    skippedCount,
    bits,
  };
}
