-- Classificacao opcional do produto: departamento > secao > grupo > subgrupo.
-- As chaves compostas impedem vinculos entre empresas ou ramos diferentes.

CREATE TABLE product_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  department_id uuid NOT NULL,
  name text NOT NULL CHECK (length(btrim(name)) > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT product_sections_department_fk FOREIGN KEY (tenant_id, department_id)
    REFERENCES departments(tenant_id, id),
  CONSTRAINT product_sections_path_unique UNIQUE (tenant_id, department_id, id),
  CONSTRAINT product_sections_name_unique UNIQUE (tenant_id, department_id, name)
);

CREATE TABLE product_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  department_id uuid NOT NULL,
  section_id uuid NOT NULL,
  name text NOT NULL CHECK (length(btrim(name)) > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT product_groups_section_fk FOREIGN KEY (tenant_id, department_id, section_id)
    REFERENCES product_sections(tenant_id, department_id, id),
  CONSTRAINT product_groups_path_unique UNIQUE (tenant_id, department_id, section_id, id),
  CONSTRAINT product_groups_name_unique UNIQUE (tenant_id, department_id, section_id, name)
);

CREATE TABLE product_subgroups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  department_id uuid NOT NULL,
  section_id uuid NOT NULL,
  group_id uuid NOT NULL,
  name text NOT NULL CHECK (length(btrim(name)) > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT product_subgroups_group_fk FOREIGN KEY (tenant_id, department_id, section_id, group_id)
    REFERENCES product_groups(tenant_id, department_id, section_id, id),
  CONSTRAINT product_subgroups_path_unique UNIQUE (tenant_id, department_id, section_id, group_id, id),
  CONSTRAINT product_subgroups_name_unique UNIQUE (tenant_id, department_id, section_id, group_id, name)
);

ALTER TABLE products
  ADD COLUMN section_id uuid,
  ADD COLUMN group_id uuid,
  ADD COLUMN subgroup_id uuid,
  ADD CONSTRAINT products_group_requires_section CHECK (group_id IS NULL OR section_id IS NOT NULL),
  ADD CONSTRAINT products_subgroup_requires_group CHECK (subgroup_id IS NULL OR group_id IS NOT NULL),
  ADD CONSTRAINT products_section_path_fk FOREIGN KEY (tenant_id, department_id, section_id)
    REFERENCES product_sections(tenant_id, department_id, id),
  ADD CONSTRAINT products_group_path_fk FOREIGN KEY (tenant_id, department_id, section_id, group_id)
    REFERENCES product_groups(tenant_id, department_id, section_id, id),
  ADD CONSTRAINT products_subgroup_path_fk FOREIGN KEY (tenant_id, department_id, section_id, group_id, subgroup_id)
    REFERENCES product_subgroups(tenant_id, department_id, section_id, group_id, id);

CREATE INDEX products_hierarchy_idx
  ON products (tenant_id, department_id, section_id, group_id, subgroup_id);

-- A previa do CSV compara SKU sem diferenciar maiusculas de minusculas.
CREATE UNIQUE INDEX products_tenant_sku_case_insensitive_unique
  ON products (tenant_id, lower(sku));
