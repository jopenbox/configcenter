/* 
 * 作者：钟勋 (e-mail:zhongxunking@163.com)
 */

/*
 * 修订记录:
 * @author 钟勋 2017-09-16 16:34 创建
 */
package org.antframework.configcenter.web.controller.manage;

import org.antframework.common.util.facade.EmptyResult;
import org.antframework.configcenter.facade.api.RefreshService;
import org.antframework.configcenter.facade.order.RefreshClientsOrder;
import org.antframework.manager.web.common.ManagerAssert;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 刷新controller
 */
@RestController
@RequestMapping("/manage/refresh")
public class RefreshController {
    @Autowired
    private RefreshService refreshService;

    /**
     * 刷新客户端
     *
     * @param appId     应用id（不传表示刷新所有应用）
     * @param profileId 环境id（不传表示刷新所有环境）
     */
    @RequestMapping("/refreshClients")
    public EmptyResult refreshClients(String appId, String profileId) {
        if (appId == null) {
            ManagerAssert.admin();
        } else {
            ManagerAssert.adminOrHaveRelation(appId);
        }
        RefreshClientsOrder order = new RefreshClientsOrder();
        order.setAppId(appId);
        order.setProfileId(profileId);

        return refreshService.refreshClients(order);
    }
}
