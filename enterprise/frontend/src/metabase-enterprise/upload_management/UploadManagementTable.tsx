import { useCallback, useMemo, useState } from "react";
import { msgid, ngettext, t } from "ttag";

import { SettingHeader } from "metabase/admin/settings/components/SettingHeader";
import { ClientSortableTable } from "metabase/common/components/Table";
import {
  BulkActionBar,
  BulkActionButton,
} from "metabase/components/BulkActionBar";
import { DelayedLoadingAndErrorWrapper } from "metabase/components/LoadingAndErrorWrapper/DelayedLoadingAndErrorWrapper";
import Link from "metabase/core/components/Link";
import { useDispatch } from "metabase/lib/redux";
import * as Urls from "metabase/lib/urls";
import { addUndo } from "metabase/redux/undo";
import { Box, Button, Checkbox, Flex, Icon, Text } from "metabase/ui";
import {
  useDeleteUploadTableMutation,
  useListUploadTablesQuery,
} from "metabase-enterprise/api";
import type { Table } from "metabase-types/api";

import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { getDateDisplay } from "./utils";

const columns = [
  { key: "checkbox", name: "", sortable: false },
  { key: "name", name: t`Table name` },
  { key: "created_at", name: t`Created at` },
  { key: "schema", name: t`Schema` },
  { key: "actions", name: "", sortable: false },
];

export function UploadManagementTable() {
  const [selectedItems, setSelectedItems] = useState<Table[]>([]);
  const [deleteTableRequest] = useDeleteUploadTableMutation();
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const dispatch = useDispatch();

  // TODO: once we have uploads running through RTK Query, we can remove the force update
  // because we can properly invalidate the tables tag
  const {
    data: uploadTables = [],
    error,
    isLoading,
  } = useListUploadTablesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const deleteTable = useCallback(
    async (table: Table, sendToTrash: boolean) => {
      return deleteTableRequest({
        tableId: table.id,
        "archive-cards": sendToTrash,
      });
    },
    [deleteTableRequest],
  );

  const selectedItemIds = useMemo(
    () => new Set(selectedItems.map(item => item.id)),
    [selectedItems],
  );

  const renderRow = useCallback(
    (row: Table) => (
      <UploadTableRow
        item={row}
        isSelected={selectedItemIds.has(row.id)}
        onSelect={newItem =>
          setSelectedItems(prevItems => [...prevItems, newItem])
        }
        onDeselect={newItem =>
          setSelectedItems(prevItems =>
            prevItems.filter(i => i.id !== newItem.id),
          )
        }
        onTrash={item => {
          setSelectedItems([item]);
          setShowDeleteConfirmModal(true);
        }}
      />
    ),
    [selectedItemIds],
  );

  if (isLoading || error) {
    return <DelayedLoadingAndErrorWrapper loading={isLoading} error={error} />;
  }

  if (!uploadTables?.length) {
    return null;
  }

  return (
    <Box p="md" pb="xl" my="lg">
      <DeleteConfirmModal
        opened={showDeleteConfirmModal}
        tables={selectedItems}
        onConfirm={async sendToTrash => {
          const result = await Promise.all(
            selectedItems.map(table => deleteTable(table, sendToTrash)),
          );

          setShowDeleteConfirmModal(false);

          if (result.some(result => "error" in result)) {
            const message = ngettext(
              msgid`Error deleting table`,
              `Error deleting tables`,
              selectedItems.length,
            );

            dispatch(
              addUndo({ message, toastColor: "error", icon: "warning" }),
            );
          } else if (result.length > 0) {
            const message = ngettext(
              msgid`1 table deleted`,
              `${result.length} tables deleted`,
              result.length,
            );

            dispatch(addUndo({ message }));
          }
          setSelectedItems([]);
        }}
        onClose={() => setShowDeleteConfirmModal(false)}
      />
      {selectedItems.length > 0 && !showDeleteConfirmModal && (
        <BulkActionBar
          opened={selectedItems.length > 0}
          message={ngettext(
            msgid`Selected ${selectedItems.length} table`,
            `Selected ${selectedItems.length} tables`,
            selectedItems.length,
          )}
        >
          <BulkActionButton onClick={() => setShowDeleteConfirmModal(true)}>
            {t`Delete`}
          </BulkActionButton>
        </BulkActionBar>
      )}
      <SettingHeader id="upload-tables-list" title={t`Manage Uploads`} />
      <Text fw="bold" color="text-medium">
        {t`Uploaded Tables`}
      </Text>
      <ClientSortableTable
        data-testid="upload-tables-table"
        columns={columns}
        rows={uploadTables}
        rowRenderer={row => renderRow(row)}
      />
    </Box>
  );
}

const UploadTableRow = ({
  item,
  onSelect,
  onDeselect,
  onTrash,
  isSelected,
}: {
  item: Table;
  onSelect: (item: Table) => void;
  onDeselect: (item: Table) => void;
  onTrash: (item: Table) => void;
  isSelected: boolean;
}) => {
  const createdAtString = getDateDisplay(item.created_at);

  return (
    <tr>
      <td>
        <Checkbox
          size="xs"
          checked={isSelected}
          onChange={e => (e.target.checked ? onSelect(item) : onDeselect(item))}
        />
      </td>
      <td>
        <Link
          to={
            Urls.modelToUrl({
              id: item.id as number,
              name: item.name,
              model: "table",
              database: { id: item.db_id },
            }) ?? "/"
          }
          variant="brand"
        >
          {item.name}
        </Link>
      </td>
      <td>{createdAtString}</td>
      <td>{item.schema}</td>
      <td>
        <Flex align="center" justify="flex-end">
          <Button
            onClick={() => onTrash(item)}
            variant="subtle"
            className="Button Button--borderless"
            color="text-medium"
          >
            <Icon name="trash" />
          </Button>
        </Flex>
      </td>
    </tr>
  );
};
