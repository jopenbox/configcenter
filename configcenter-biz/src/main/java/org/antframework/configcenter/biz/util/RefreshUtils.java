/* 
 * 作者：钟勋 (e-mail:zhongxunking@163.com)
 */

/*
 * 修订记录:
 * @author 钟勋 2018-08-11 15:29 创建
 */
package org.antframework.configcenter.biz.util;

import org.antframework.boot.core.Contexts;
import org.antframework.common.util.facade.EmptyOrder;
import org.antframework.configcenter.facade.api.RefreshService;
import org.antframework.configcenter.facade.order.RefreshClientsOrder;

/**
 * 刷新工具类
 */
public final class RefreshUtils {
    // 刷新服务
    private static final RefreshService REFRESH_SERVICE = Contexts.getApplicationContext().getBean(RefreshService.class);

    /**
     * 刷新zookeeper
     */
    public static void refreshZk() {
        REFRESH_SERVICE.refreshZk(new EmptyOrder());
    }

    /**
     * 刷新客户端
     *
     * @param appId     应用id（null表示刷新所有应用）
     * @param profileId 环境id（null表示刷新所有环境）
     */
    public static void refreshClients(String appId, String profileId) {
        RefreshClientsOrder order = new RefreshClientsOrder();
        order.setAppId(appId);
        order.setProfileId(profileId);

        REFRESH_SERVICE.refreshClients(order);
    }
}
