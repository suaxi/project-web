import {initData} from "@/api/data";

export default {
    data() {
        return {
            loading: false,
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
            //请求url（由混入组件提供）
            url: '',
            //查询参数（由混入组件提供）
            params: {}
        }
    },
    methods: {
        //每页条数改变
        sizeChangeHandler(size) {
            this.page.pageSize = size;
            this.page.pageNum = 1;
            this.refresh()
        },
        //页数改变
        pageChangeHandler(num) {
            this.page.pageNum = num;
            this.refresh()
        },
        delChangePage() {
            //删除最后一页的最后一条数据时，或多选删除第二页的数据时，预防页码错误导致请求无数据
            if (this.tableData.length === 1 && this.page.pageSize !== 1) {
                this.page.pageNum -= 1
            }
        },
        beforeInit() {
            //混入的组件存在同名方法，会被原组件的函数覆盖，所以该方法不会被调用
            console.log('crud组件被调用');
            return false
        },
        refresh() {
            if (!this.beforeInit()) {
                return
            }
            this.loading = true;
            let queryParams = {
                pageNum: this.page.pageNum,
                pageSize: this.page.pageSize
            };
            initData(this.url, queryParams).then(res => {
                this.tableData = res.records;
                this.page.total = res.total;
                this.loading = false
            }).catch(() => {
                //接口请求异常时关闭loading
                this.loading = false
            })
        },
    }
}