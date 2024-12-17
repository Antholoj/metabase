import cx from "classnames";
import { useState } from "react";
import { t } from "ttag";

import { useGetChannelInfoQuery } from "metabase/api";
import ButtonWithStatus from "metabase/components/ButtonWithStatus";
import ModalContent from "metabase/components/ModalContent";
import Button from "metabase/core/components/Button";
import CS from "metabase/css/core/index.css";
import { alertIsValid } from "metabase/lib/alert";
import { useDispatch, useSelector } from "metabase/lib/redux";
import { deleteAlert, updateAlert } from "metabase/notifications/redux/alert";
import { updateUrl } from "metabase/query_builder/actions";
import {
  getQuestion,
  getVisualizationSettings,
} from "metabase/query_builder/selectors";
import { getUser, getUserIsAdmin } from "metabase/selectors/user";
import { ALERT_TYPE_ROWS } from "metabase-lib/v1/Alert";
import type { Alert } from "metabase-types/api";

import { AlertEditForm } from "./AlertEditForm";
import { AlertModalTitle } from "./AlertModalTitle";
import { AlertModalFooter } from "./AlertModals.styled";
import { DeleteAlertSection } from "./DeleteAlertSection";

interface UpdateAlertModalContentProps {
  alert: Alert;
  notificationType: "alert" | "subscription";
  onAlertUpdated: () => void;
  onCancel: () => void;
}

export const UpdateAlertModalContent = ({
  alert,
  notificationType,
  onAlertUpdated,
  onCancel,
}: UpdateAlertModalContentProps) => {
  const dispatch = useDispatch();

  const user = useSelector(getUser);
  const isAdmin = useSelector(getUserIsAdmin);
  const question = useSelector(getQuestion);
  const visualizationSettings = useSelector(getVisualizationSettings);

  const [modifiedAlert, setModifiedAlert] = useState(alert);
  const onAlertChange = (newModifiedAlert: Alert) =>
    setModifiedAlert(newModifiedAlert);

  const { data: channelSpec = {} } = useGetChannelInfoQuery();

  const onUpdateAlert = async () => {
    await dispatch(updateAlert(modifiedAlert));
    await dispatch(updateUrl(question, { dirty: false }));
    onAlertUpdated();
  };

  const onDeleteAlert = async () => {
    await dispatch(deleteAlert(alert?.id));
    onAlertUpdated();
  };

  const isCurrentUser = alert?.creator.id === user?.id;
  const title = isCurrentUser ? t`Edit your alert` : t`Edit alert`;
  const isValid = alertIsValid(modifiedAlert, channelSpec);

  const alertType =
    notificationType === "subscription"
      ? ALERT_TYPE_ROWS
      : question?.alertType(visualizationSettings);

  // TODO: Remove PulseEdit css hack
  return (
    <ModalContent onClose={onCancel} data-testid="alert-edit">
      <div
        className={cx(CS.mlAuto, CS.mrAuto, CS.mb4)}
        style={{ maxWidth: "550px" }}
      >
        <AlertModalTitle text={title} />
        <AlertEditForm
          alertType={alertType}
          type={notificationType}
          alert={modifiedAlert}
          onAlertChange={onAlertChange}
        />
        {isAdmin && (
          <DeleteAlertSection alert={alert} onDeleteAlert={onDeleteAlert} />
        )}

        <AlertModalFooter>
          <Button onClick={onCancel} className={CS.mr2}>{t`Cancel`}</Button>
          <ButtonWithStatus
            titleForState={{ default: t`Save changes` }}
            disabled={!isValid}
            onClickOperation={onUpdateAlert}
          />
        </AlertModalFooter>
      </div>
    </ModalContent>
  );
};
