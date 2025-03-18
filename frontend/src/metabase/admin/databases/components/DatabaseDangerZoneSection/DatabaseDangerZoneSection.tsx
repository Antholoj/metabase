import { useDisclosure } from "@mantine/hooks";
import { useCallback, useRef } from "react";
import { t } from "ttag";

import DeleteDatabaseModal from "metabase/admin/databases/components/DeleteDatabaseModel/DeleteDatabaseModal";
import { useDiscardDatabaseFieldValuesMutation } from "metabase/api";
import { ConfirmModal } from "metabase/components/ConfirmModal";
import ModalWithTrigger from "metabase/components/ModalWithTrigger";
import { isSyncCompleted } from "metabase/lib/syncing";
import { Button, Flex } from "metabase/ui";
import type Database from "metabase-lib/v1/metadata/Database";
import type { DatabaseId } from "metabase-types/api";

import { DatabaseInfoSection } from "../DatabaseInfoSection";

export const DatabaseDangerZoneSection = ({
  isAdmin,
  database,
  deleteDatabase,
}: {
  isAdmin: boolean;
  database: Database;
  deleteDatabase: (databaseId: DatabaseId) => Promise<void>;
}) => {
  const [
    discardModalOpened,
    { close: closeDiscardModal, open: openDiscardModal },
  ] = useDisclosure();
  const deleteDatabaseModal = useRef<any>();

  const [discardDatabaseFieldValues] = useDiscardDatabaseFieldValuesMutation();

  const handleDeleteDatabaseModalClose = useCallback(() => {
    deleteDatabaseModal.current.close();
  }, []);

  const handleDeleteDatabase = useCallback(
    () => deleteDatabase(database.id),
    [deleteDatabase, database.id],
  );

  const hasCompletedSync = isSyncCompleted(database);
  const shouldHideSection =
    database.is_attached_dwh ||
    [hasCompletedSync, isAdmin].every(bool => bool === false);

  if (shouldHideSection) {
    return null;
  }

  return (
    <DatabaseInfoSection
      name={t`Danger zone`}
      description={t`Remove this database and other destructive actions.`}
      data-testid="database-danger-zone-section"
    >
      <Flex gap="sm" wrap="wrap">
        {isSyncCompleted(database) && (
          <>
            <Button
              onClick={openDiscardModal}
              variant="filled"
              color="danger"
            >{t`Discard saved field values`}</Button>
            <ConfirmModal
              data-testid="modal"
              opened={discardModalOpened}
              title={t`Discard saved field values`}
              onClose={closeDiscardModal}
              onConfirm={() => {
                discardDatabaseFieldValues(database.id);
                closeDiscardModal();
              }}
            />
          </>
        )}
        {isAdmin && (
          <ModalWithTrigger
            triggerElement={
              <Button
                variant="filled"
                color="danger"
              >{t`Remove this database`}</Button>
            }
            ref={deleteDatabaseModal}
          >
            <DeleteDatabaseModal
              database={database}
              onClose={handleDeleteDatabaseModalClose}
              onDelete={handleDeleteDatabase}
            />
          </ModalWithTrigger>
        )}
      </Flex>
    </DatabaseInfoSection>
  );
};
