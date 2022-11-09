import {initData} from "@/api/data";
import Vue from 'vue';

function CRUD(options) {
    const data = {
        ...options,
        loading: true,
        //表格数据
        tableData: [],
        //分页参数
        page: {
            //页码
            pageNum: 1,
            //每页数据条数
            pageSize: 10,
            //总数
            total: 0
        },
        //查询参数
        params: {}
    }

    const methods = {
        //每页条数改变
        sizeChangeHandler(size) {
            crud.page.pageSize = size;
            crud.page.pageNum = 1;
            crud.refresh()
        },
        //页数改变
        pageChangeHandler(num) {
            crud.page.pageNum = num;
            crud.refresh()
        },
        delChangePage() {
            //删除最后一页的最后一条数据时，或多选删除第二页的数据时，预防页码错误导致请求无数据
            if (this.tableData.length === 1 && this.page.pageSize !== 1) {
                this.page.pageNum -= 1
            }
        },
        refresh() {
            this.loading = true;
            let queryParams = {
                pageNum: this.page.pageNum,
                pageSize: this.page.pageSize
            };
            initData(this.url, queryParams).then(res => {
                this.tableData = res.records;
                this.page.total = res.total;
                this.loading = false;
                callVmHook(crud, CRUD.HOOK.afterRefresh)
            }).catch(() => {
                //接口请求异常时关闭loading
                this.loading = false
            })
        },
        //扩展crud的数据
        updateProp(name, value) {
            Vue.set(crud.props, name, value)
        }
    }

    const crud = Object.assign({}, data)

    //crud设置为响应式对象
    Vue.observable(crud)
    //附加方法
    Object.assign(crud, methods)
    //附加VueComponent相关方法
    Object.assign(crud, {
        //预留4位存储：主页、头部、分页、表单 组件
        vms: Array(4),

        /**
         * 注册组件实例
         * @param type 类型
         * @param vm 组件实例
         * @param index 索引
         */
        registerVm(type, vm, index = -1) {
            const vmObj = {
                type,
                vm
            }
            if (index < 0) {
                this.vms.push(vmObj);
                return
            }
            if (index > 4) {
                this.vms[index] = vmObj;
                return
            }
            this.vms.length = Math.max(this.vms.length, index);
            this.vms.splice(index, 1, vmObj)
        },
        unregisterVm(vm) {
            for (let i = this.vms.length - 1; i > 0; i--) {
                if (this.vms[i] === undefined) {
                    continue
                }
                if (this.vms[i].vm === vm) {
                    if (i < 4) {
                        //预留预先设置的4位存储
                        this.vms[i] = undefined
                    } else {
                        this.vms[i].splice(i, 1)
                    }
                    break
                }
            }
        }
    })

    //冻结处理，需扩展数据时，使用crud.updateProp()方法
    Object.freeze(crud);
    return crud
}

function callVmHook(crud, hook) {
    let ret = true;
    //部分组件为了扮演多个角色，在调用钩子时，需去重（即当一个组件混入presenter(), header(), form(), crud()其中的两个以上时，就会出现重复注册）
    const vmSet = new Set();
    crud.vms.forEach(vm => vm && vmSet.add(vm.vm));
    vmSet.forEach(vm => {
        if (vm[hook]) {
            ret = vm[hook].apply() !== false && ret
        }
    })
    return ret
}

/**
 * CRUD 钩子
 */
CRUD.HOOK = {
    //刷新之后
    afterRefresh: 'afterCrudRefresh',
    //新建/编辑 ---> 校验之后
    afterValidateCU: 'afterCrudValidateCU'
}

/**
 * crud主页
 */
function presenter(crud) {
    return {
        data() {
            return {
                //将crud与当前组件实例对象关联
                crud: this.crud
            }
        },
        beforeCreate() {
            this.crud = crud;
            this.crud.registerVm('presenter', this, 0)
        },
        destroyed() {
            this.crud.unregisterVm(this)
        }
    }
}

export default CRUD
export {presenter}