-- Object Registry records remain first-class rows in qilife.records.
-- Provider identifiers are unique only inside an owner's object/provider/type
-- namespace after case/whitespace normalization.

create unique index if not exists uq_qilife_object_identifier_normalized
on qilife.records (
  owner_id,
  (data->>'object_id'),
  (lower(btrim(data->>'provider'))),
  (lower(regexp_replace(btrim(data->>'identifier_type'), '[[:space:]-]+', '_', 'g'))),
  (lower(btrim(data->>'identifier_value')))
)
where entity_key = 'object_identifier'
  and archived_at is null;

create index if not exists idx_qilife_object_children
on qilife.records (owner_id, entity_key, (data->>'object_id'))
where entity_key in ('object_identifier', 'object_record', 'secret_reference');

create index if not exists idx_qilife_object_relationship_from
on qilife.records (owner_id, (data->>'from_object_id'))
where entity_key = 'object_relationship';

create index if not exists idx_qilife_object_relationship_to
on qilife.records (owner_id, (data->>'to_object_id'))
where entity_key = 'object_relationship';
