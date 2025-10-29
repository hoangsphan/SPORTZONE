import { Grid, List } from "lucide-react";

interface ViewModeToggleProps {
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

const ViewModeToggle = ({
  viewMode,
  onViewModeChange,
}: ViewModeToggleProps) => {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600">Hiển thị:</span>
      <div className="flex border border-gray-300 rounded-lg overflow-hidden">
        <button
          onClick={() => onViewModeChange("grid")}
          className={`p-2 ${
            viewMode === "grid"
              ? "bg-green-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
          title="Grid view"
        >
          <Grid className="w-4 h-4" />
        </button>
        <button
          onClick={() => onViewModeChange("list")}
          className={`p-2 ${
            viewMode === "list"
              ? "bg-green-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
          title="List view"
        >
          <List className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ViewModeToggle;
