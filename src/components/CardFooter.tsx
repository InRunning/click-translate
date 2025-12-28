import { RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
export default function CardFooter({
  currentEngine,
  onRefresh,
}: {
  currentEngine: string;
  onRefresh: () => void;
}) {
  const { t } = useTranslation();
  return (
    <>
      <div className="flex items-center  text-xs text-gray-400 mt-2 space-x-4">
        <div className="flex items-center">
          <span>translated by {currentEngine}</span>
          <span
            onClick={onRefresh}
            data-tip={t("Refresh")}
            className="ml-2 text-gray-500 mt-[2px] p-[1px] rounded tooltip tooltip-top  cursor-pointer"
          >
            <RotateCcw className={`w-[14px] h-[14px] fill-none`} />
          </span>
        </div>
      </div>
    </>
  );
}
