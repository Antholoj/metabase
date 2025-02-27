/**
 * Metabase API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: v1.53.2-SNAPSHOT
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 *
 */

import ApiClient from '../ApiClient';

/**
 * The MetabaseApiUserUserGroupMembership model module.
 * @module model/MetabaseApiUserUserGroupMembership
 * @version v1.53.2-SNAPSHOT
 */
class MetabaseApiUserUserGroupMembership {
    /**
     * Constructs a new <code>MetabaseApiUserUserGroupMembership</code>.
     * Group Membership info of a User.   In which :is_group_manager is only included if &#x60;advanced-permissions&#x60; is enabled.
     * @alias module:model/MetabaseApiUserUserGroupMembership
     * @param id {Number} value must be an integer greater than zero.
     */
    constructor(id) { 
        
        MetabaseApiUserUserGroupMembership.initialize(this, id);
    }

    /**
     * Initializes the fields of this object.
     * This method is used by the constructors of any subclasses, in order to implement multiple inheritance (mix-ins).
     * Only for internal use.
     */
    static initialize(obj, id) { 
        obj['id'] = id;
    }

    /**
     * Constructs a <code>MetabaseApiUserUserGroupMembership</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/MetabaseApiUserUserGroupMembership} obj Optional instance to populate.
     * @return {module:model/MetabaseApiUserUserGroupMembership} The populated <code>MetabaseApiUserUserGroupMembership</code> instance.
     */
    static constructFromObject(data, obj) {
        if (data) {
            obj = obj || new MetabaseApiUserUserGroupMembership();

            if (data.hasOwnProperty('id')) {
                obj['id'] = ApiClient.convertToType(data['id'], 'Number');
            }
            if (data.hasOwnProperty('is_group_manager')) {
                obj['is_group_manager'] = ApiClient.convertToType(data['is_group_manager'], 'Boolean');
            }
        }
        return obj;
    }

    /**
     * Validates the JSON data with respect to <code>MetabaseApiUserUserGroupMembership</code>.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @return {boolean} to indicate whether the JSON data is valid with respect to <code>MetabaseApiUserUserGroupMembership</code>.
     */
    static validateJSON(data) {
        // check to make sure all required properties are present in the JSON string
        for (const property of MetabaseApiUserUserGroupMembership.RequiredProperties) {
            if (!data.hasOwnProperty(property)) {
                throw new Error("The required field `" + property + "` is not found in the JSON data: " + JSON.stringify(data));
            }
        }

        return true;
    }


}

MetabaseApiUserUserGroupMembership.RequiredProperties = ["id"];

/**
 * value must be an integer greater than zero.
 * @member {Number} id
 */
MetabaseApiUserUserGroupMembership.prototype['id'] = undefined;

/**
 * Only relevant if `advanced-permissions` is enabled. If it is, you should always include this key.
 * @member {Boolean} is_group_manager
 */
MetabaseApiUserUserGroupMembership.prototype['is_group_manager'] = undefined;






export default MetabaseApiUserUserGroupMembership;

