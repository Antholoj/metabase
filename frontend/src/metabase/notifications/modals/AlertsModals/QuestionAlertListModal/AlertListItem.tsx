import cx from "classnames";
import { type MouseEvent, useState } from "react";
import { t } from "ttag";

import { formatCreatorMessage } from "metabase/account/notifications/components/NotificationCard/utils";
import {
  formatNotificationSchedule,
  getNotificationHandlersGroupedByTypes,
} from "metabase/lib/notifications";
import { useSelector } from "metabase/lib/redux";
import {
  HandlersInfo,
  NotificationActionButton,
} from "metabase/notifications/modals/shared/components";
import { getUser } from "metabase/selectors/user";
import { Box, Group, Text } from "metabase/ui";
import type {
  AlertNotification,
  NotificationCardSendCondition,
  NotificationChannel,
  User,
} from "metabase-types/api";

import S from "./AlertListItem.module.css";

type AlertListItemProps = {
  alert: AlertNotification;
  canEdit: boolean;
  users: User[] | undefined;
  httpChannelsConfig: NotificationChannel[] | undefined;
  onEdit: (alert: AlertNotification) => void;
  onUnsubscribe: (alert: AlertNotification) => void;
  onDelete: (alert: AlertNotification) => void;
};

export const AlertListItem = ({
  alert,
  canEdit,
  users,
  httpChannelsConfig,
  onEdit,
  onUnsubscribe,
  onDelete,
}: AlertListItemProps) => {
  const user = useSelector(getUser);

  const [showHoverActions, setShowHoverActions] = useState(false);

  const { emailHandler, slackHandler, hookHandlers } =
    getNotificationHandlersGroupedByTypes(alert.handlers);
  const subscription = alert.subscriptions[0];

  const handleEdit = () => {
    if (canEdit) {
      onEdit(alert);
    }
  };

  const handleUnsubscribe = (e: MouseEvent) => {
    e.stopPropagation();

    onUnsubscribe(alert);
  };

  const handleDelete = (e: MouseEvent) => {
    e.stopPropagation();

    onDelete(alert);
  };

  const handleMouseEnter = () => {
    setShowHoverActions(true);
  };

  const handleMouseLeave = () => {
    setShowHoverActions(false);
  };

  return (
    <Box
      className={cx(
        S.notificationListItem,
        canEdit && S.notificationListItemEditable,
      )}
      p="1rem"
      onClick={handleEdit}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Text className={S.itemTitle} size="md" lineClamp={1} fw="bold">
        {formatTitle(alert.payload.send_condition)}
      </Text>
      <Group gap="xs" align="center" c="text-secondary">
        {subscription && (
          <Text size="sm" c="inherit">
            {formatNotificationSchedule(subscription)}
          </Text>
        )}
        {user && (
          <>
            <Text size="sm" c="text-light">
              •
            </Text>
            <Text size="sm" c="inherit">
              {formatCreatorMessage(alert, user?.id)}
            </Text>
          </>
        )}
      </Group>

      <HandlersInfo
        emailHandler={emailHandler}
        slackHandler={slackHandler}
        hookHandlers={hookHandlers}
        users={users}
        httpChannelsConfig={httpChannelsConfig}
      />

      {showHoverActions && (
        <div className={S.actionButtonContainer}>
          {canEdit ? (
            <NotificationActionButton
              label={t`Delete this alert`}
              iconName="trash"
              onClick={handleDelete}
            />
          ) : (
            <NotificationActionButton
              label={t`Unsubscribe from this`}
              iconName="unsubscribe"
              onClick={handleUnsubscribe}
            />
          )}
        </div>
      )}
    </Box>
  );
};

const formatTitle = (sendCondition: NotificationCardSendCondition): string => {
  switch (sendCondition) {
    case "has_result":
      return t`Alert when this has results`;
    case "goal_above":
      return t`Alert when this reaches a goal`;
    case "goal_below":
      return t`Alert when this goes below a goal`;
  }
};
<<<<<<< HEAD:frontend/src/metabase/notifications/modals/AlertsModals/QuestionAlertListModal/AlertListItem.tsx
=======

const formatEmailHandlerInfo = (
  emailHandler: NotificationHandlerEmail,
  users: User[] | undefined,
) => {
  if (!users) {
    return null;
  }

  const usersMap = _.indexBy(users, "id");

  const emailRecipients = emailHandler.recipients
    .map((recipient) => {
      if (recipient.type === "notification-recipient/raw-value") {
        return recipient.details.value;
      }
      if (recipient.type === "notification-recipient/user") {
        return usersMap[recipient.user_id]?.email;
      }
    })
    .filter(isNotFalsy);

  const maxEmailsToDisplay = 2;

  if (emailRecipients.length > maxEmailsToDisplay) {
    const restItemsLength = emailRecipients.length - maxEmailsToDisplay;
    return [
      emailRecipients.slice(0, maxEmailsToDisplay).join(", "),
      ngettext(
        msgid`${restItemsLength} other`,
        `${restItemsLength} others`,
        restItemsLength,
      ),
    ].join(", ");
  }

  return emailRecipients.join(", ");
};

const formatSlackHandlerInfo = (handler: NotificationHandlerSlack) => {
  return handler.recipients[0]?.details.value;
};

const formatHttpHandlersInfo = (
  handlers: NotificationHandlerHttp[],
  httpChannelsConfig: NotificationChannel[] | undefined,
) => {
  return handlers
    .map(
      ({ channel_id }) =>
        httpChannelsConfig?.find(({ id }) => channel_id === id)?.name ||
        t`unknown`,
    )
    .join(", ");
};
>>>>>>> master:frontend/src/metabase/notifications/modals/QuestionAlertListModal/AlertListItem.tsx
