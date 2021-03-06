/* 
 * 作者：钟勋 (e-mail:zhongxunking@163.com)
 */

/*
 * 修订记录:
 * @author 钟勋 2017-09-15 18:03 创建
 */
package org.antframework.configcenter.facade.order;

import org.antframework.common.util.facade.AbstractOrder;
import org.antframework.configcenter.facade.vo.Scope;
import org.hibernate.validator.constraints.NotBlank;

import javax.validation.constraints.NotNull;

/**
 * 查找应用的属性key-order
 */
public class FindAppPropertyKeysOrder extends AbstractOrder {
    // 应用id
    @NotBlank
    private String appId;
    // 最小作用域
    @NotNull
    private Scope minScope;

    public String getAppId() {
        return appId;
    }

    public void setAppId(String appId) {
        this.appId = appId;
    }

    public Scope getMinScope() {
        return minScope;
    }

    public void setMinScope(Scope minScope) {
        this.minScope = minScope;
    }
}
