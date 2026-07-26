-- QiLife's authenticated Qi API client must reach the private qilife schema so
-- PostgreSQL can enforce the owner policies in 0002.

grant usage on schema qilife to authenticated;
grant select, insert, update, delete on table qilife.records to authenticated;
