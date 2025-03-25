import { useMemo } from "react";
import type { Route } from "react-router";
import { push, replace } from "react-router-redux";
import { t } from "ttag";

import { DatabaseEditConnectionForm } from "metabase/admin/databases/components/DatabaseEditConnectionForm";
import { useGetDatabaseQuery, useUpdateDatabaseMutation } from "metabase/api";
import { useDocsUrl } from "metabase/common/hooks";
import { LoadingAndErrorWrapper } from "metabase/components/LoadingAndErrorWrapper";
import ExternalLink from "metabase/core/components/ExternalLink";
import title from "metabase/hoc/Title";
import { useDispatch } from "metabase/lib/redux";
import * as Urls from "metabase/lib/urls";
import { addUndo } from "metabase/redux/undo";
import { Flex, Icon, Modal, Text } from "metabase/ui";
import { useCreateDestinationDatabaseMutation } from "metabase-enterprise/api";
import type { Database, DatabaseData } from "metabase-types/api";

import { paramIdToGetQuery } from "../utils";

import S from "./DestinationDatabaseConnectionModal.module.css";

export const DestinationDatabaseConnectionModalInner = ({
  params: { databaseId, destinationDatabaseId },
  route,
}: {
  params: { databaseId: string; destinationDatabaseId?: string };
  route: Route;
}) => {
  const dispatch = useDispatch();

  // TODO: get the final docs url from the writing team
  // eslint-disable-next-line no-unconditional-metabase-links-render -- Admin settings
  const { url: docsUrl } = useDocsUrl("databases/db-routing");

  const primaryDbReq = useGetDatabaseQuery(paramIdToGetQuery(databaseId));
  const destinationDbReq = useGetDatabaseQuery(
    paramIdToGetQuery(destinationDatabaseId),
  );
  const [createDistinationDatabase] = useCreateDestinationDatabaseMutation();
  const [updateDatabase] = useUpdateDatabaseMutation();

  const isLoading = primaryDbReq.isLoading || destinationDbReq.isLoading;
  const error = primaryDbReq.error || destinationDbReq.error;
  const isNewDatabase = destinationDatabaseId === undefined;

  const destinationDatabase = useMemo<Partial<Database> | undefined>(() => {
    return isNewDatabase
      ? { engine: primaryDbReq.currentData?.engine }
      : destinationDbReq.currentData;
  }, [isNewDatabase, primaryDbReq.currentData, destinationDbReq.currentData]);

  const addingNewDatabase = destinationDatabaseId === undefined;

  const handleCloseModal = (method = "push") => {
    const dbId = parseInt(databaseId, 10);
    if (method === "push") {
      dispatch(push(Urls.viewDatabase(dbId)));
    } else {
      dispatch(replace(Urls.viewDatabase(dbId)));
    }
  };

  const handleCreateDestinationDatabase = async (database: DatabaseData) => {
    return createDistinationDatabase({
      router_database_id: parseInt(databaseId, 10),
      mirrors: [database],
    }).unwrap();
  };

  const handleSaveDatabase = async (database: DatabaseData) => {
    if (typeof database.id === "number") {
      return updateDatabase({
        ...database,
        id: database.id,
        auto_run_queries: database.auto_run_queries ?? true,
      }).unwrap();
    } else {
      return handleCreateDestinationDatabase(database);
    }
  };

  const handleOnSubmit = () => {
    dispatch(
      addUndo({
        message: addingNewDatabase
          ? t`Destination database created successfully`
          : t`Destination database updated successfully`,
      }),
    );
    handleCloseModal("replace");
  };

  return (
    <Modal
      title={
        addingNewDatabase
          ? t`Add destination database`
          : t`Edit destination database`
      }
      opened
      onClose={handleCloseModal}
      padding="xl"
      classNames={{
        content: S.modalContent,
        header: S.modalHeader,
        body: S.modalBody,
      }}
    >
      <LoadingAndErrorWrapper loading={isLoading} error={error} noWrapper>
        <DatabaseEditConnectionForm
          database={destinationDatabase}
          isAttachedDWH={destinationDatabase?.is_attached_dwh ?? false}
          handleSaveDb={handleSaveDatabase}
          onSubmitted={handleOnSubmit}
          onCancel={handleCloseModal}
          route={route}
          config={{
            name: { isSlug: true },
            engine: { fieldState: "hidden" },
          }}
          prepend={
            <Flex
              bg="accent-gray-light"
              align="center"
              justify="space-between"
              className={S.apiInfo}
            >
              <Text>{t`You can also add databases programmatically via the API.`}</Text>
              <ExternalLink
                key="link"
                href={docsUrl}
                style={{ display: "flex", alignItems: "center", gap: 4 }}
              >
                {t`Learn more`} <Icon name="share" aria-hidden />
              </ExternalLink>
            </Flex>
          }
          autofocusFieldName="name"
        />
      </LoadingAndErrorWrapper>
    </Modal>
  );
};

export const DestinationDatabaseConnectionModal = title(
  ({ database }: { database: DatabaseData }) => database && database.name,
)(DestinationDatabaseConnectionModalInner);
