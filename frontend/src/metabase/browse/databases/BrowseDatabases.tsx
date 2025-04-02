import cx from "classnames";
import { Link } from "react-router";
import { t } from "ttag";

import {
  ContentTranslationProvider,
  useTranslateContent2,
} from "metabase/i18n/components/ContentTranslationContext";
import NoResults from "assets/img/no_results.svg";
import { useListDatabasesQuery } from "metabase/api";
import { LoadingAndErrorWrapper } from "metabase/components/LoadingAndErrorWrapper";
import CS from "metabase/css/core/index.css";
import { getEngineLogo } from "metabase/databases/utils/engine";
import { color } from "metabase/lib/colors";
import { useSelector } from "metabase/lib/redux";
import * as Urls from "metabase/lib/urls";
import { newDatabase } from "metabase/lib/urls";
import { getUserIsAdmin } from "metabase/selectors/user";
import {
  Box,
  Group,
  Icon,
  SimpleGrid,
  Stack,
  type StackProps,
  Text,
  Title,
} from "metabase/ui";

import {
  BrowseContainer,
  BrowseMain,
  BrowseSection,
  CenteredEmptyState,
} from "../components/BrowseContainer.styled";
import { BrowseDataHeader } from "../components/BrowseDataHeader";

import DB from "./BrowseDatabases.module.css";
import { trackAddDatabaseDBList } from "./analytics";
import { useTranslateContent } from "metabase/i18n/components/ContentTranslationContext";

export const BrowseDatabases = () => {
  const isAdmin = useSelector(getUserIsAdmin);

  const { data, isLoading, error } = useListDatabasesQuery();
  const databases = data?.data;
  const tc = useTranslateContent2();

  if (error) {
    return <LoadingAndErrorWrapper error />;
  }

  if (!databases && isLoading) {
    return <LoadingAndErrorWrapper loading />;
  }

  if (!databases?.length && !isAdmin) {
    return (
      <CenteredEmptyState
        title={<Box mb=".5rem">{t`No databases here yet`}</Box>}
        illustrationElement={
          <Box mb=".5rem">
            <img src={NoResults} />
          </Box>
        }
      />
    );
  }

  return (
    <ContentTranslationProvider>
      <BrowseContainer>
        <BrowseDataHeader />
        <BrowseMain>
          <BrowseSection>
            <SimpleGrid data-testid="database-browser" cols={3}>
              {databases &&
                databases.length > 0 &&
                databases.map((database) => (
                  <Link to={Urls.browseDatabase(database)} key={database.id}>
                    <DatabaseCard
                      bg="bg-white"
                      className={cx(CS.rounded, CS.bordered, DB.dbCard)}
                    >
                      <Icon
                        name="database"
                        color={color("accent2")}
                        size={32}
                      />
                      <Title order={2} size="md" lh={1.2} c="inherit">
                        {tc(database.name)}
                      </Title>
                    </DatabaseCard>
                  </Link>
                ))}

              {isAdmin && (
                <Link
                  to={newDatabase()}
                  onClick={() => trackAddDatabaseDBList()}
                >
                  <DatabaseCard
                    className={cx(CS.rounded, CS.bordered, DB.addCard)}
                  >
                    <Group gap="xs">
                      <CardImageWrapper database={"postgres"} />
                      <CardImageWrapper database={"mysql"} />
                      <CardImageWrapper database={"snowflake"} />
                    </Group>
                    <div>
                      <Title order={2} size="md" lh={1.2} c="inherit">
                        {t`Add a database`}
                      </Title>
                      <Text
                        color="inherit"
                        fz="sm"
                        lh={1}
                        span
                      >{t`20+ data connectors. Start exploring in minutes.`}</Text>
                    </div>
                  </DatabaseCard>
                </Link>
              )}
            </SimpleGrid>
          </BrowseSection>
        </BrowseMain>
      </BrowseContainer>
    </ContentTranslationProvider>
  );
};

const CardImageWrapper = ({ database }: { database: string }) => {
  return (
    <Box
      bg="white"
      h="xl"
      w="xl"
      className={CS.rounded}
      style={{
        boxShadow:
          // eslint-disable-next-line no-color-literals
          "0px 0px 0px 1px rgba(0, 0, 0, 0.05), 0px 1px 4px 0px rgba(0, 0, 0, 0.10)",
      }}
    >
      <img src={getEngineLogo(database)} alt={t`${database} database logo`} />
    </Box>
  );
};

const DatabaseCard = ({ children, ...props }: StackProps) => {
  return (
    <Stack h="8.5rem" justify="space-between" p="lg" {...props}>
      {children}
    </Stack>
  );
};
