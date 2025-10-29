import FieldListItem from "./FieldListItem";

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

interface FieldsListProps {
  fields: Field[];
  onBookField: (field: Field) => void;
}

const FieldsList = ({ fields, onBookField }: FieldsListProps) => {
  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <FieldListItem key={field.id} field={field} onBookField={onBookField} />
      ))}
    </div>
  );
};

export default FieldsList;
