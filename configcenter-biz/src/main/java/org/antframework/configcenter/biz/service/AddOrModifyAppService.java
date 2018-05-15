/* 
 * 作者：钟勋 (e-mail:zhongxunking@163.com)
 */

/*
 * 修订记录:
 * @author 钟勋 2017-08-20 15:05 创建
 */
package org.antframework.configcenter.biz.service;

import org.antframework.common.util.facade.BizException;
import org.antframework.common.util.facade.CommonResultCode;
import org.antframework.common.util.facade.EmptyResult;
import org.antframework.common.util.facade.Status;
import org.antframework.common.util.zookeeper.ZkTemplate;
import org.antframework.configcenter.common.ZkUtils;
import org.antframework.configcenter.dal.dao.AppDao;
import org.antframework.configcenter.dal.dao.ProfileDao;
import org.antframework.configcenter.dal.entity.App;
import org.antframework.configcenter.dal.entity.Profile;
import org.antframework.configcenter.facade.order.AddOrModifyAppOrder;
import org.apache.commons.lang3.StringUtils;
import org.apache.zookeeper.CreateMode;
import org.bekit.service.annotation.service.Service;
import org.bekit.service.annotation.service.ServiceAfter;
import org.bekit.service.annotation.service.ServiceExecute;
import org.bekit.service.engine.ServiceContext;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

/**
 * 添加或修改应用服务
 */
@Service(enableTx = true)
public class AddOrModifyAppService {
    @Autowired
    private AppDao appDao;
    @Autowired
    private ProfileDao profileDao;
    @Autowired
    private ZkTemplate zkTemplate;

    @ServiceExecute
    public void execute(ServiceContext<AddOrModifyAppOrder, EmptyResult> context) {
        AddOrModifyAppOrder order = context.getOrder();
        // 校验是否出现循环继承和祖先是否存在
        checkCycleAndAncestors(order.getAppId(), order.getParent());
        // 新增或修改应用
        App app = appDao.findLockByAppId(order.getAppId());
        if (app == null) {
            app = new App();
        }
        BeanUtils.copyProperties(order, app);
        appDao.save(app);
    }

    @ServiceAfter
    public void after(ServiceContext<AddOrModifyAppOrder, EmptyResult> context) {
        AddOrModifyAppOrder order = context.getOrder();
        // 同步zookeeper
        List<Profile> profiles = profileDao.findAll();
        for (Profile profile : profiles) {
            zkTemplate.createNode(ZkTemplate.buildPath(profile.getProfileId(), order.getAppId()), CreateMode.PERSISTENT);
            zkTemplate.setData(ZkTemplate.buildPath(profile.getProfileId(), order.getAppId()), ZkUtils.getCurrentDate());
        }
    }

    // 校验是否出现循环继承和祖先是否存在
    private void checkCycleAndAncestors(String appId, String ancestorId) {
        StringBuilder builder = new StringBuilder(appId);
        while (ancestorId != null) {
            builder.append("-->").append(ancestorId);
            if (StringUtils.equals(ancestorId, appId)) {
                throw new BizException(Status.FAIL, CommonResultCode.INVALID_PARAMETER.getCode(), String.format("出现循环继承[%s]", builder.toString()));
            }
            App ancestor = appDao.findLockByAppId(ancestorId);
            if (ancestor == null) {
                throw new BizException(Status.FAIL, CommonResultCode.INVALID_PARAMETER.getCode(), String.format("不存在应用[%s]", ancestorId));
            }
            ancestorId = ancestor.getParent();
        }
    }
}
