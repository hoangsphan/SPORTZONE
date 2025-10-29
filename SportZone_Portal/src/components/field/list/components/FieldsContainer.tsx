import FieldsGrid from "./FieldsGrid";
import FieldsList from "./FieldsList";
import LoadingState from "./LoadingState";
import EmptyState from "./EmptyState";

interface CategoryField {
  categoryFieldId: number;
  categoryFieldName: string;
}

interface Field {
  id: number;
  name: string;
  location: string;
  openTime: string;
  closeTime: string;
  description: string;
  subdescription: string;
  image: string;
  imageUrls: string[];
  categoryFields: CategoryField[];
  available: boolean;
}

interface FieldsContainerProps {
  fields: Field[];
  viewMode: "grid" | "list";
  loading: boolean;
  onBookField: (field: Field) => void;
}

const FieldsContainer = ({
  fields,
  viewMode,
  loading,
  onBookField,
}: FieldsContainerProps) => {
  if (loading) {
    return <LoadingState />;
  }

  if (fields.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      {viewMode === "grid" && (
        <FieldsGrid fields={fields} onBookField={onBookField} />
      )}
      {viewMode === "list" && (
        <FieldsList fields={fields} onBookField={onBookField} />
      )}
    </>
  );
};

export default FieldsContainer;
