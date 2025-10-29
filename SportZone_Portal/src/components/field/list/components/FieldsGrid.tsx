import FieldCard from "./FieldCard";

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

interface FieldsGridProps {
  fields: Field[];
  onBookField: (field: Field) => void;
}

const FieldsGrid = ({ fields, onBookField }: FieldsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {fields.map((field) => (
        <FieldCard key={field.id} field={field} onBookField={onBookField} />
      ))}
    </div>
  );
};

export default FieldsGrid;
