import { Fragment } from "react";
import { IndexRedirect, IndexRoute } from "react-router";
import { t } from "ttag";

import AdminApp from "metabase/admin/app/components/AdminApp";
import { DatabaseConnectionModal } from "metabase/admin/databases/containers/DatabaseConnectionModal";
import { DatabaseEditApp } from "metabase/admin/databases/containers/DatabaseEditApp";
import DatabaseListApp from "metabase/admin/databases/containers/DatabaseListApp";
import DataModelApp from "metabase/admin/datamodel/containers/DataModelApp";
import RevisionHistoryApp from "metabase/admin/datamodel/containers/RevisionHistoryApp";
import SegmentApp from "metabase/admin/datamodel/containers/SegmentApp";
import SegmentListApp from "metabase/admin/datamodel/containers/SegmentListApp";
import { getMetadataRoutes } from "metabase/admin/datamodel/metadata/routes";
import { AdminPeopleApp } from "metabase/admin/people/containers/AdminPeopleApp";
import { EditUserModal } from "metabase/admin/people/containers/EditUserModal";
import GroupDetailApp from "metabase/admin/people/containers/GroupDetailApp";
import GroupsListingApp from "metabase/admin/people/containers/GroupsListingApp";
import { NewUserModal } from "metabase/admin/people/containers/NewUserModal";
import PeopleListingApp from "metabase/admin/people/containers/PeopleListingApp";
import UserActivationModal from "metabase/admin/people/containers/UserActivationModal";
import UserPasswordResetModal from "metabase/admin/people/containers/UserPasswordResetModal";
import { UserSuccessModal } from "metabase/admin/people/containers/UserSuccessModal";
import { PerformanceApp } from "metabase/admin/performance/components/PerformanceApp";
import getAdminPermissionsRoutes from "metabase/admin/permissions/routes";
import { SettingsEditor } from "metabase/admin/settings/app/components/SettingsEditor";
import { Help } from "metabase/admin/tasks/components/Help";
import { Logs } from "metabase/admin/tasks/components/Logs";
import { JobInfoApp } from "metabase/admin/tasks/containers/JobInfoApp";
import { JobTriggersModal } from "metabase/admin/tasks/containers/JobTriggersModal";
import {
  ModelCacheRefreshJobModal,
  ModelCacheRefreshJobs,
} from "metabase/admin/tasks/containers/ModelCacheRefreshJobs";
import { TaskModal } from "metabase/admin/tasks/containers/TaskModal";
import { TasksApp } from "metabase/admin/tasks/containers/TasksApp";
import TroubleshootingApp from "metabase/admin/tasks/containers/TroubleshootingApp";
import Tools from "metabase/admin/tools/containers/Tools";
import { createAdminRouteGuard } from "metabase/admin/utils";
import CS from "metabase/css/core/index.css";
import { withBackground } from "metabase/hoc/Background";
import { ModalRoute } from "metabase/hoc/ModalRoute";
import { Route } from "metabase/hoc/Title";
import {
  PLUGIN_ADMIN_ROUTES,
  PLUGIN_ADMIN_TOOLS,
  PLUGIN_ADMIN_TROUBLESHOOTING,
  PLUGIN_ADMIN_USER_MENU_ROUTES,
  PLUGIN_CACHING,
  PLUGIN_DB_ROUTING,
} from "metabase/plugins";

import { PerformanceTabId } from "./performance/types";
import RedirectToAllowedSettings from "./settings/containers/RedirectToAllowedSettings";
import { ToolsUpsell } from "./tools/components/ToolsUpsell";

const getRoutes = (store, CanAccessSettings, IsAdmin) => (
  <Route
    path="/admin"
    component={withBackground(CS.bgWhite)(CanAccessSettings)}
  >
    <Route title={t`Admin`} component={AdminApp}>
      <IndexRoute component={RedirectToAllowedSettings} />
      <Route
        path="databases"
        title={t`Databases`}
        component={createAdminRouteGuard("databases")}
      >
        <IndexRoute component={DatabaseListApp} />
        <Route component={DatabaseListApp}>
          <Route component={IsAdmin}>
            <ModalRoute path="create" modal={DatabaseConnectionModal} noWrap />
          </Route>
        </Route>
        <Route path=":databaseId" component={DatabaseEditApp}>
          <ModalRoute path="edit" modal={DatabaseConnectionModal} />
          {PLUGIN_DB_ROUTING.getDestinationDatabaseRoutes(IsAdmin)}
        </Route>
      </Route>
      <Route path="datamodel" component={createAdminRouteGuard("data-model")}>
        <Route title={t`Table Metadata`} component={DataModelApp}>
          {getMetadataRoutes()}
          <Route path="segments" component={SegmentListApp} />
          <Route path="segment/create" component={SegmentApp} />
          <Route path="segment/:id" component={SegmentApp} />
          <Route path="segment/:id/revisions" component={RevisionHistoryApp} />
        </Route>
      </Route>
      {/* PEOPLE */}
      <Route path="people" component={createAdminRouteGuard("people")}>
        <Route title={t`People`} component={AdminPeopleApp}>
          <IndexRoute component={PeopleListingApp} />

          {/*NOTE: this must come before the other routes otherwise it will be masked by them*/}
          <Route path="groups" title={t`Groups`}>
            <IndexRoute component={GroupsListingApp} />
            <Route path=":groupId" component={GroupDetailApp} />
          </Route>

          <Route path="" component={PeopleListingApp}>
            <ModalRoute path="new" modal={NewUserModal} />
          </Route>

          <Route path=":userId" component={PeopleListingApp}>
            <IndexRedirect to="/admin/people" />
            <ModalRoute path="edit" modal={EditUserModal} />
            <ModalRoute path="success" modal={UserSuccessModal} />
            <ModalRoute path="reset" modal={UserPasswordResetModal} />
            <ModalRoute path="deactivate" modal={UserActivationModal} />
            <ModalRoute path="reactivate" modal={UserActivationModal} />
            {PLUGIN_ADMIN_USER_MENU_ROUTES.map((getRoutes, index) => (
              <Fragment key={index}>{getRoutes(store)}</Fragment>
            ))}
          </Route>
        </Route>
      </Route>
      {/* Troubleshooting */}
      <Route
        path="troubleshooting"
        component={createAdminRouteGuard("troubleshooting")}
      >
        <Route title={t`Troubleshooting`} component={TroubleshootingApp}>
          <IndexRedirect to="help" />
          <Route path="help" component={Help} />
          <Route path="tasks" component={TasksApp}>
            <ModalRoute path=":taskId" modal={TaskModal} />
          </Route>
          <Route path="jobs" component={JobInfoApp}>
            <ModalRoute
              path=":jobKey"
              modal={JobTriggersModal}
              modalProps={{ wide: true }}
            />
          </Route>
          <Route path="logs" component={Logs} />
          {PLUGIN_ADMIN_TROUBLESHOOTING.EXTRA_ROUTES}
        </Route>
      </Route>
      {/* SETTINGS */}
      <Route path="settings" component={createAdminRouteGuard("settings")}>
        <IndexRedirect to="general" />
        <Route title={t`Settings`}>
          <Route path="*" component={SettingsEditor} />
        </Route>
      </Route>
      {/* PERMISSIONS */}
      <Route path="permissions" component={IsAdmin}>
        {getAdminPermissionsRoutes(store)}
      </Route>
      {/* PERFORMANCE */}
      <Route
        path="performance"
        component={createAdminRouteGuard("performance")}
      >
        <Route title={t`Performance`}>
          <IndexRedirect to={PerformanceTabId.Databases} />
          {PLUGIN_CACHING.getTabMetadata().map(({ name, key, tabId }) => (
            <Route
              component={(routeProps) => (
                <PerformanceApp {...routeProps} tabId={tabId} />
              )}
              title={name}
              path={tabId}
              key={key}
            />
          ))}
        </Route>
      </Route>
      <Route path="tools" component={createAdminRouteGuard("tools")}>
        <Route title={t`Tools`} component={Tools}>
          <IndexRedirect to="errors" />
          <Route
            key="error-overview"
            path="errors"
            title={t`Erroring Questions`}
            // If the audit_app feature flag is present, our enterprise plugin system kicks in and we render the
            // appropriate enterprise component. The upsell component is shown in all other cases.
            component={PLUGIN_ADMIN_TOOLS.COMPONENT || ToolsUpsell}
          />
          <Route
            path="model-caching"
            title={t`Model Caching Log`}
            component={ModelCacheRefreshJobs}
          >
            <ModalRoute path=":jobId" modal={ModelCacheRefreshJobModal} />
          </Route>
        </Route>
      </Route>
      {/* PLUGINS */}
      <Fragment>
        {PLUGIN_ADMIN_ROUTES.map((getRoutes) => getRoutes(store))}
      </Fragment>
    </Route>
  </Route>
);

export default getRoutes;
