import { t } from "ttag";

import { ToolbarButton } from "metabase/components/ToolbarButton";
import { closeSidebar, setSidebar } from "metabase/dashboard/actions";
import { SIDEBAR_NAME } from "metabase/dashboard/constants";
import { getIsShowDashboardInfoSidebar } from "metabase/dashboard/selectors";
import { useDispatch, useSelector } from "metabase/lib/redux";
import { useRegisterActions } from "kbar";

export const DashboardInfoButton = () => {
  const dispatch = useDispatch();
  const isShowingDashboardInfoSidebar = useSelector(
    getIsShowDashboardInfoSidebar,
  );

  const handleClick = () => {
    isShowingDashboardInfoSidebar
      ? dispatch(closeSidebar())
      : dispatch(setSidebar({ name: SIDEBAR_NAME.info }));
  };

  useRegisterActions(
    [
      {
        id: "info-dashboard",
        name: "Toggle Dashboard Info",
        shortcut: ["]"],
        perform: handleClick,
      },
    ],
    [isShowingDashboardInfoSidebar],
  );

  return (
    <ToolbarButton
      aria-label={t`More info`}
      tooltipLabel={t`More info`}
      icon="info"
      isActive={isShowingDashboardInfoSidebar}
      disabled={isShowingDashboardInfoSidebar}
      onClick={handleClick}
    />
  );
};
