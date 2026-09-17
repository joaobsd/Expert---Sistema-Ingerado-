import { Shell } from '../../../components/shell';
import { ProductImportClient } from '../../../components/product-import-client';

export default function ProductImportPage() {
  return (
    <Shell page="produtos" eyebrow="CADASTROS / PRODUTOS" title="Preparar catálogo">
      <ProductImportClient />
    </Shell>
  );
}
