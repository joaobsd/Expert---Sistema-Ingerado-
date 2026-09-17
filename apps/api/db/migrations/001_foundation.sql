CREATE TABLE tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_name text NOT NULL,
  cnpj text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tenants_cnpj_unique UNIQUE (cnpj)
);

CREATE TABLE branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  name text NOT NULL,
  state_code char(2) NOT NULL,
  time_zone text NOT NULL DEFAULT 'America/Fortaleza',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT branches_tenant_id_id_unique UNIQUE (tenant_id, id)
);

CREATE TABLE departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT departments_tenant_id_id_unique UNIQUE (tenant_id, id),
  CONSTRAINT departments_tenant_name_unique UNIQUE (tenant_id, name)
);

CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  department_id uuid NOT NULL,
  sku text NOT NULL,
  description text NOT NULL,
  gtin text,
  unit_code text NOT NULL,
  ncm text,
  cest text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  registered_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT products_tenant_sku_unique UNIQUE (tenant_id, sku),
  CONSTRAINT products_department_same_tenant FOREIGN KEY (tenant_id, department_id)
    REFERENCES departments(tenant_id, id)
);

CREATE INDEX products_registered_at_idx ON products (tenant_id, registered_at DESC);
CREATE INDEX products_department_idx ON products (tenant_id, department_id);
