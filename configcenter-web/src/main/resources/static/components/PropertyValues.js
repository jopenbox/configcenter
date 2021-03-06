// 属性值管理组件
const PropertyValuesTemplate = `
<div>
    <el-row style="margin-bottom: 10px">
        <el-col>
            <span style="font-size: large;color: #409EFF;">环境：</span>
            <el-select v-model="currentProfileId" @change="switchProfile" placeholder="请选择环境" size="medium">
                <el-option v-for="profile in allProfiles" :value="profile.profileId" :label="toShowingProfile(profile)" :key="profile.profileId"></el-option>
            </el-select>
        </el-col>
    </el-row>
    <div v-for="appProperties in appPropertieses" style="margin-bottom: 50px">
        <el-row v-if="appProperties.appId === appId" style="margin-bottom: 10px">
            <el-col :offset="6" :span="12" style="text-align: center;">
                <span style="font-size: x-large;color: #409EFF;">{{ toShowingApp(appProperties.app) }}</span>
            </el-col>
            <el-col :span="6" style="text-align: end">
                <el-button icon="el-icon-close" @click="findAppPropertieses" :disabled="!edited" size="small">取消修改</el-button>
                <el-popover placement="top" v-model="submitPopoverShowing">
                    <p>提交后应用的配置将被修改，确定提交？</p>
                    <div style="text-align: right; margin: 0">
                        <el-button size="mini" type="text" @click="submitPopoverShowing = false">取消</el-button>
                        <el-button type="primary" size="mini" @click="submitEdited">确定</el-button>
                    </div>
                    <el-button slot="reference" type="primary" icon="el-icon-upload" @click="submitPopoverShowing = true" :disabled="!edited" size="small">提交修改</el-button>
                </el-popover>
            </el-col>
        </el-row>
        <el-row v-else style="margin-bottom: 10px">
            <el-col :offset="4" :span="16" style="text-align: center;">
                <span style="font-size: large;color: #67c23a;">{{ toShowingApp(appProperties.app) }}</span>
            </el-col>
        </el-row>
        <el-table :data="appProperties.properties" v-loading="appProperties.appId === appId ? selfPropertiesLoading : false" :key="appProperties.appId" :default-sort="{prop: 'key'}" border stripe :style="{width: appProperties.appId === appId ? '100%' : 'calc(100% - 90px)'}">
            <el-table-column prop="key" label="属性key" sortable></el-table-column>
            <el-table-column prop="value" label="属性值">
                <template slot-scope="{ row }">
                    <div v-if="!row.editing">
                        <div v-if="!row.edited">
                            <el-tag v-if="row.value === null">无效</el-tag>
                            <span v-else>{{ row.value }}</span>
                        </div>
                        <div v-else style="margin-top: 10px; margin-right: 30px">
                            <el-badge value="已修改">
                                <el-tag v-if="row.value === null">无效</el-tag>
                                <span v-else>{{ row.value }}</span>
                            </el-badge>
                        </div>
                    </div>
                    <el-input v-else v-model="row.editingValue" type="textarea" autosize size="small" clearable placeholder="请输入属性值"></el-input>
                </template>
            </el-table-column>
            <el-table-column prop="scope" label="作用域" sortable width="140px">
                <template slot-scope="{ row }">
                    <div>
                        <el-tag v-if="row.scope === 'PRIVATE'">私有</el-tag>
                        <el-tag v-else-if="row.scope === 'PROTECTED'" type="success">可继承</el-tag>
                        <el-tag v-else-if="row.scope === 'PUBLIC'" type="warning">公开</el-tag>
                    </div>
                </template>
            </el-table-column>
            <el-table-column v-if="appProperties.appId === appId" label="操作" header-align="center" width="90px">
                <template slot-scope="{ row }">
                    <el-row>
                        <el-col style="text-align: center">
                            <el-tooltip v-if="!row.editing" content="修改" placement="top" :open-delay="1000" :hide-after="3000">
                                <el-button @click="startEditing(row)" type="primary" icon="el-icon-edit" size="small" circle></el-button>
                            </el-tooltip>
                            <el-button-group v-else>
                                <el-tooltip content="取消修改" placement="top" :open-delay="1000" :hide-after="3000">
                                    <el-button @click="row.editing = false" type="info" icon="el-icon-close" size="small" circle></el-button>
                                </el-tooltip>
                                <el-tooltip content="确认修改" placement="top" :open-delay="1000" :hide-after="3000">
                                    <el-button @click="saveEditing(row)" type="success" icon="el-icon-check" size="small" circle></el-button>
                                </el-tooltip>
                            </el-button-group>
                        </el-col>
                    </el-row>
                </template>
            </el-table-column>
        </el-table>
    </div>
</div>
`;

const PropertyValues = {
    template: PropertyValuesTemplate,
    props: ['appId', 'profileId'],
    data: function () {
        return {
            currentProfileId: this.profileId,
            allProfiles: [],
            selfPropertiesLoading: false,
            appPropertieses: [],
            submitPopoverShowing: false
        };
    },
    computed: {
        edited: function () {
            const theThis = this;

            let edited = false;
            this.appPropertieses.forEach(function (appProperties) {
                if (appProperties.appId !== theThis.appId) {
                    return;
                }
                appProperties.properties.forEach(function (property) {
                    edited = edited || property.edited;
                });
            });

            return edited;
        }
    },
    watch: {
        '$route': function () {
            this.findAllProfiles();
            this.findAppPropertieses();
        }
    },
    created: function () {
        this.findAllProfiles();
        this.findAppPropertieses();
    },
    methods: {
        findAllProfiles: function () {
            const theThis = this;
            axios.get('../manage/profile/findAllProfiles')
                .then(function (result) {
                    if (!result.success) {
                        Vue.prototype.$message.error(result.message);
                        return;
                    }
                    theThis.allProfiles = result.profiles;
                });
        },
        findAppPropertieses: function () {
            const theThis = this;
            this.selfPropertiesLoading = true;
            axios.get('../manage/propertyValue/findInheritedProperties', {
                params: {
                    appId: this.appId,
                    profileId: this.profileId
                }
            }).then(function (result) {
                theThis.selfPropertiesLoading = false;
                if (!result.success) {
                    Vue.prototype.$message.error(result.message);
                    return;
                }
                theThis.appPropertieses = result.appPropertieses;
                theThis.appPropertieses.forEach(function (appProperties) {
                    appProperties.properties.forEach(function (property) {
                        Vue.set(property, 'edited', false);
                        Vue.set(property, 'editing', false);
                        Vue.set(property, 'editingValue', null);
                    });
                    Vue.set(appProperties, 'app', null);
                    axios.get('../manage/app/findApp', {
                        params: {
                            appId: appProperties.appId
                        }
                    }).then(function (result) {
                        if (!result.success) {
                            Vue.prototype.$message.error(result.message);
                            return;
                        }
                        appProperties.app = result.app;
                    });
                });
            });
        },
        switchProfile: function (profileId) {
            this.$router.replace('/configs/' + this.appId + '/' + profileId);
        },
        startEditing: function (property) {
            property.editing = true;
            property.editingValue = property.value;
        },
        saveEditing: function (property) {
            property.edited = true;
            property.editing = false;
            property.value = property.editingValue;
            if (property.value !== null) {
                property.value = property.value.trim();
            }
            if (!property.value) {
                property.value = null;
            }
        },
        submitEdited: function () {
            this.submitPopoverShowing = false;

            const theThis = this;
            let keys = [], values = [];
            this.appPropertieses.forEach(function (appProperties) {
                if (appProperties.appId !== theThis.appId) {
                    return;
                }
                appProperties.properties.forEach(function (property) {
                    if (property.edited) {
                        keys.push(property.key);
                        values.push(property.value);
                    }
                });
            });

            this.selfPropertiesLoading = true;
            axios.post('../manage/propertyValue/setPropertyValue', {
                appId: this.appId,
                profileId: this.profileId,
                keys: JSON.stringify(keys),
                values: JSON.stringify(values)
            }).then(function (result) {
                theThis.selfPropertiesLoading = false;
                if (!result.success) {
                    Vue.prototype.$message.error(result.message);
                    return;
                }
                Vue.prototype.$message.success(result.message);
                theThis.findAppPropertieses();
            });
        },
        toShowingProfile: function (profile) {
            if (!profile) {
                return '';
            }
            let text = profile.profileId;
            if (profile.profileName) {
                text += '（' + profile.profileName + '）';
            }
            return text;
        },
        toShowingApp: function (app) {
            if (!app) {
                return '';
            }
            let text = app.appId;
            if (app.appName) {
                text += '（' + app.appName + '）';
            }
            return text;
        }
    }
};