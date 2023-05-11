<script setup>

</script>

<template>
    <div class="center-wrapper">
        <div class="center-box">
            <div class="card">
                <div class="image">
                    <img style="height: 100%;" src="/icons/logo.png" alt="logo_with_text">
                </div>
                <div class="title">
                    <span>连接你的分布式纯纯看番</span>
                </div>

                <div class="content">
                    <div class="content-main">
                        <span>地址</span>
                        <input type="text" />
                        <span>密钥（可选）</span>
                        <input type="password" />
                    </div>

                    <span class="content-footer">
                        不知道什么是分布式纯纯看番？<a href="">了解详情</a>
                    </span>
                </div>

                <div class="footer">
                    <div class="footer-box">
                        <div class="footer-box-item right">
                            <button class="link-button">下一步</button>
                        </div>
                        <div class="footer-box-item"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
input {
    height: 35px;
    border-radius: 4px;
    border: 1px solid #b7bac0;
    
    outline: none;
    padding: 6px 6px 3px;
    margin-top: 4px;
    margin-bottom: 16px;

    font-size: 18px;
}

a {
    color: rgb(21, 91, 182);
}

.link-button {
    background-color: rgb(26, 115, 232);
    outline: 0;
    cursor: pointer;

    color: #ffffff;
    font-weight: 500;
    height: 36px;

    margin: 6px 0px;
    padding: 0px 24px;
    border-radius: 4px;
    border: 1px solid #dcdfe6;

    display: inline-block;
    box-sizing: border-box;

    &:focus {
        box-shadow: 0 0 30px #b1aeae52, 0 0 0 1px #fff, 0 0 0 3px rgba(50, 100, 150, 0.4);
        outline: none;
    }

    &:hover {
        background: rgba(26, 115, 232, 90%);
    }
}

.card {
    height: auto;
    display: flex;
    min-height: 320px;
    box-flex: 1;
    flex-grow: 1;
    overflow: hidden;
    padding: 24px 24px 36px;
    flex-direction: column;

    .image {
        display: flex;
        height: 24px;
        justify-content: center;
    }

    .title {
        display: flex;
        justify-content: center;

        span {
            padding-bottom: 0;
            padding-top: 16px;
            font-size: 24px;
            font-weight: 400;
            line-height: 1.3333;
            margin-bottom: 0;
            margin-top: 0;
            word-break: break-word;
        }
    }

    .content {
        display: flex;
        flex-direction: column;
        margin-top: 26px;

        .content-main {
            display: flex;
            flex-direction: column;
            min-height: 120px;
            margin-bottom: 32px;
        }

        .content-footer {
            display: flex;
            flex-grow: 1;
            align-items: flex-end;

            font-size: 15px;
            line-height: 1.4286;
        }
    }

    .footer {
        align-items: flex-start;
        display: flex;
        box-flex: 0;
        flex-grow: 0;
        flex-wrap: wrap;
        justify-content: space-between;
        margin-top: 26px;
        min-height: 48px;
        padding-bottom: 20px;

        .footer-box {
            display: flex;
            flex-direction: row-reverse;
            flex-wrap: wrap;
            width: 100%;

            .footer-box-item {
                box-flex: 1;
                flex-grow: 1;
            }

            .right {
                text-align: right;
            }
        }


    }
}

@media all and (min-width: 450px) {
    .card {
        padding: 48px 40px 36px;
    }
}

.center-box {
    display: flex;
    flex-direction: column;
    max-width: 100%;
    position: relative;
    z-index: 2;
}

@media all and (min-width: 601px) {

    .center-wrapper {
        display: flex;
        flex-direction: column;
        min-height: 100%;
        position: relative;

        .center-box {
            border: 1px solid #dadce0;
            border-radius: 8px;
            display: block;
            flex-shrink: 0;
            margin: 0 auto;
            width: 450px;
        }
    }

    .center-wrapper:before,
    .center-wrapper:after {
        box-flex: 1;
        flex-grow: 1;
        content: "";
        display: block;
        height: 24px;
    }
}
</style>