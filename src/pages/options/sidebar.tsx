import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";


export interface MenuItem {
  name: string;
  active: boolean;
  path: string;
  externalLink?: string;
}
export interface RenderMenuItem extends MenuItem {
  component?: ReactNode;
}

export default function Sidebar({
  menus,
  onMenuClick,
}: {
  menus: MenuItem[];
  onMenuClick: (param: MenuItem) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex shrink-0 md:flex-col flex-row bg-gray-200 md:pl-[40px] md:pr-[100px] px-3 py-2 md:py-0 w-full md:w-auto">
      <div className="md:h-[50px]" />
      <div className="grow md:grow-0 md:pb-6 w-full">
        <div className="flex md:flex-col flex-row md:gap-[25px] gap-2 overflow-x-auto">
          {menus.map((item) => {
            return (
              <div
                onClick={() => onMenuClick(item)}
                key={item.name}
                className={`transition-all cursor-pointer rounded-full bg-white md:py-[10px] md:px-[30px] py-2 px-3 
              text-center min-w-[120px] sm:min-w-[140px] md:min-w-[150px] ${
                item.active ? "!bg-blue-500 text-white" : "hover:bg-blue-200"
              }`}
              >
                {t(item.name)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
