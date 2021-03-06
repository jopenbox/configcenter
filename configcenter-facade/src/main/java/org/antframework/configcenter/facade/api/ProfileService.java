/* 
 * 作者：钟勋 (e-mail:zhongxunking@163.com)
 */

/*
 * 修订记录:
 * @author 钟勋 2017-08-20 02:08 创建
 */
package org.antframework.configcenter.facade.api;

import org.antframework.common.util.facade.EmptyOrder;
import org.antframework.common.util.facade.EmptyResult;
import org.antframework.configcenter.facade.order.AddOrModifyProfileOrder;
import org.antframework.configcenter.facade.order.DeleteProfileOrder;
import org.antframework.configcenter.facade.order.QueryProfilesOrder;
import org.antframework.configcenter.facade.result.FindAllProfilesResult;
import org.antframework.configcenter.facade.result.QueryProfilesResult;

/**
 * 环境服务
 */
public interface ProfileService {
    /**
     * 添加或修改环境
     */
    EmptyResult addOrModifyProfile(AddOrModifyProfileOrder order);

    /**
     * 删除环境
     */
    EmptyResult deleteProfile(DeleteProfileOrder order);

    /**
     * 查找所有环境
     */
    FindAllProfilesResult findAllProfiles(EmptyOrder order);

    /**
     * 查询环境
     */
    QueryProfilesResult queryProfiles(QueryProfilesOrder order);
}
