# jinan_signin
JiNan MBA annual meeting e-signin WeChat miniprogram.

![image](https://github.com/lowskiluk/jinan_signin/blob/master/miniprogram/images/ScreenShot_sample.jpeg?raw=true)

2019/1/20  
v1.0.6 修修补补版  
修复了签到按钮可以重复按的bug，以很快的速度重复按会往数据库插入多条数据，现在改成点击之后就把按钮的disabled标志置为true，防止多次点击，在按钮事件结束之后再将该标志置为false（防止特殊情况需要再次点击签到）。

2019/1/20  
v1.0.5 终极优化版  
优化了签到流程，更安全更可靠：  
1.onload的执行过程有优化，加了判断，优化了速度。  
2.将写数据库的操作同步化，防止网络中断等突发情况导致的一直无法签到的bug。  

2019/1/18  
v1.0.4版 综合优化版  
1.根据是否已签到的状态来显示相应的view。  
2.签到成功之后显示的信息更丰富。  

2019/1/16  
v1.0.3版，改成同步onload。  
原本异步的程序走起来怪怪的，用promise，async，await改成同步执行代码。  
