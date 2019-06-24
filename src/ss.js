import React, { Component } from 'react';
import { Tabs } from 'zent';
import { MessageBox, Message } from 'element-react';
import Request from '@utils/request';
import { formatDs } from '@utils/formatTime';
import $ from 'jquery';
import '@assets/account/pet.scss';

const TabPanel = Tabs.TabPanel;

const divStyle={ backgroundImage:'url(https://img.jylc168.com/Pc/account/pet/meal.png)',}
class Pet extends Component {
  constructor(props){
    super(props);
    this.state = {
      activeId: '1',
      petInfo: {
        skill: {}
      },
      honorList: [],
      ranking: [],
      play:"",
      nextTime:'',
      nextTimeText:0,
      cardList:[],
      date:new Date(),
      honors:'',
      divStyles:false
    }
   
  }

  
  onTabChange = (id) => {
    this.setState({
      activeId: id,
    });
  }
  show() {
    const { petInfo,nextTime } = this.state;
    MessageBox.msgbox({
      title: '喂养宠物',
      message: <div className="feed-txt">当前剩余食物：{petInfo.food}棵 <br/>本次还可喂食：{petInfo.skill.food}棵 <br/>
        本次喂食数量：{ petInfo.food > petInfo.skill.food ? petInfo.skill.food : petInfo.food}棵 <br/>
          </div>,
      showCancelButton: true
    }).then(action => {
      if (action === 'confirm') {
        Request.post('/v1/pet/eat').then((res) => {
          Message({
            type: 'success',
            message: res.info
          });
          this.getPetInfo();
          this.setState({
            divStyles:true
          })
        }).catch(err => {
          Message({ 
            type: 'error',
           message:<div>{nextTime}</div>,
          });
        })
      }else {
        Message({
          type: 'info',
          message: '取消喂养'
        });
      }
    })
  }



  play(){
    Request.post('/v1/pet/travelCheck').then(res => {
      let infoText = '';
      if (!res.data.length){
        infoText = res.info + ',去玩耍'
      }
      MessageBox.msgbox({
        title: '提示',
        message: infoText,
        showCancelButton: true
      }).then(action => {
        if(action === 'confirm'){
            this.travelStart();
          }else{
            Message({
              type: 'info',
              message: '已取消'
            });
          }
        })      
    }).catch(err => {
      Message({ 
        type: 'error',
        message:err.info
      });
    })
  }
  //去旅游
  travelStart() {
    Request.post('/v1/pet/travelStart').then((res) => {
     // console.log(res.data);
      Message({
        type: 'success',
        message: <div>我去了+ {res.data.area} +等我带来远方的明信片</div>
      });
      let petImg = document.querySelector('.m-pet');
      petImg.style.backgroundImage ='url(https://img.jylc168.com/Pc/account/pet/pet_bg1.jpg)';
    }).catch(err => {
      Message({
        type: 'error',
        message:err.info
      });
    })
  }

  getPetInfo(){
    // 宠物信息
    Request.post('/v1/pet/info').then((res) => {
       let nextTime = res.data.next;
       let h = Math.floor(nextTime / 60 / 60);
       let m = Math.floor(nextTime / 60 % 60);
       let s = Math.floor(nextTime % 60)
       let nextTimeText =h + '小时' + m + '分';
       let nextTimes = '距离下次喂养还有:' + h + '小时' + m + '分钟' + s + '秒';
       console.log(nextTime);
       let honors = Number(res.data.honor/res.data.honor_max*100).toFixed(0);
       let lineup = document.querySelector('.pet-info-lineup');
       let honorsd =lineup.style.width= honors +'%';
       if(nextTime){
         this.setState({
            divStyles:true
         })
       }
      this.setState({
        petInfo: res.data,
        nextTimeText: nextTimeText,
        nextTime: nextTimes,
        honors:honorsd
      })
    })
  }

  componentWillMount(){
    
    this.getPetInfo();

    //检测旅游
    Request.post('/v1/pet/travelCheck').then((res) => {
      let petImg = document.querySelector('.m-pet');
      petImg.style.backgroundImage ='url(https://img.jylc168.com/Pc/account/pet/pet_bg.jpg)';
    }).catch(res => {
      let petImg = document.querySelector('.m-pet');
      switch (res.code) {
        case '000':
            let infoText = '';
            if (res.data.length){
              infoText = `我从${res.data[0].area}回来了,为你带回了${res.data[0].prize},继续玩耍`
            }
            MessageBox.msgbox({
              title: '提示',
              message: infoText,
              showCancelButton: true
            });
        break;
        case '001':
          petImg.style.backgroundImage ='url(https://img.jylc168.com/Pc/account/pet/pet_bg.jpg)';
        break;
        case '002':
          petImg.style.backgroundImage ='url(https://img.jylc168.com/Pc/account/pet/pet_bg1.jpg)';
        break;
        default : return;
      }
    })

    // 宠物亲密值列表
    Request.post('/v1/pet/honorList').then((res) => {
      this.setState({
        honorList: res.data.list
      })
    })
    // 亲密值排行榜
    Request.post('/v1/pet/ranking').then((res) => {
      this.setState({
        ranking: res.data
      })
    })
    //明信片统计
    Request.post('/v1/pet/postcardCount').then((res) => {
      this.setState({
        cardList : res.data
      })
    })
  }
  //合成
  cardToRed(){
    Request.post('/v1/pet/postcardToRed').then(res => {
      $(".record-frame-3").animate({"opacity":"0"},200,function(){
        $(this).hide();
      });
      $(".record-frame-4").show().css("opacity","1");
    }).catch(err => {
      Message({
        type: 'error',
        message:err.info
      });
    })
  }


 //组件销毁前的回调
 componentWillUnmount(){
  clearInterval(this.timerID);
}
tick() {
  Request.post('/v1/pet/info').then((res) => {
    let nextTime = res.data.next;
    let h = Math.floor(nextTime / 60 / 60);
    let m = Math.floor(nextTime / 60 % 60);
    let nextTimeText =h + '小时' + m + '分';
   this.setState({
     nextTimeText: nextTimeText,
   })
 }) 
}

getCook(){
  var s = document.cookie;
  if (s.indexOf('myad===1') !== -1) return; 
  var d = new Date();
  d.setHours(d.getHours() + 4); 
  document.cookie = 'myad===1;expires='+d.toGMTString();
  $(".pet-mask1,.tips").show();
}

  componentDidMount(){

    this.getCook();
    this.timerID=setInterval(()=>{
        this.tick()
    },60000)
   
    // 宠物
    const pet = {
      sheep : function(animateNum=0){
        if(animateNum>7){
            animateNum = 1;
        }
        let left = -animateNum * 271;
        let selectorImg = document.querySelector('.my-sheep-img');
        setTimeout(function(){
          if(selectorImg){
            selectorImg.style.marginLeft = left + 'px';
            animateNum++;
            pet.sheep(animateNum);
          }else {
            return;
          }
        },330)
      }
    }
    pet.sheep(1);

    //亲密记录、亲密排行榜
    function popframe(btn,frame){
        $(btn).bind("click",function(){
            $(frame).show().css("opacity","1");
            $(".pet-mask").show().css("opacity","0.5");
        })
        $(".frame-close").bind("click",function(){
            $(this).parent(frame).animate({"opacity":"0"},200,function(){
                $(this).hide();
                $(".pet-mask").animate({"opacity":"0"},200,function(){
                    $(this).hide();
                })
            });
        })
    }
    popframe(".pet-close-1",".record-frame-1")
    popframe(".pet-close-2",".record-frame-2")
    popframe(".pet-close-3",".record-frame-3")
    popframe("",".record-frame-4")

   
    $(".tips-btn,.frame-close4").bind("click",function(){
      $(".pet-mask1,.tips").animate({"opacity":"0"},200,function(){
        $(this).hide();
      })
    });

   

   
  }
  render() {
    const { petInfo, honorList, ranking,nextTimeText,cardList } = this.state;
   
    return (
      <div className="m-charge">
        <div className="chart-title" style={{margin: "10px 0 30px"}}>
          我的萌宠
        </div>
        <div className="m-pet">
          <img src="https://img.jylc168.com/Pc/account/pet/title1.png" alt="" className="my-title-1" />
          <img src="https://img.jylc168.com/Pc/account/pet/title2.png" alt="" className="my-title-2" />
          <img src="https://img.jylc168.com/Pc/account/pet/title3.png" alt="" className="my-title-3" />
          <img src="https://img.jylc168.com/Pc/account/pet/cloud_1.png" alt="" className="cloud1" />
          {/* <img src="https://img.jylc168.com/Pc/account/pet/cloud_2.png" alt="" className="cloud2" /> */}
          <img src="https://img.jylc168.com/Pc/account/pet/cloud_3.png" alt="" className="cloud3" />
          <img src="https://img.jylc168.com/Pc/account/pet/cloud_4.png" alt="" className="cloud4" />
          {/* <img src="https://img.jylc168.com/Pc/account/pet/balloon_2.png" alt="" className="balloon2 balloon" /> */}

          <div className="info-box">
            <div className="pet-img-con">
              <img className="my-pet-img" src={`https://img.jylc168.com/Pc/account/pet/pet_h_${petInfo.level || 1}.png`} alt="" />
            </div>
            <span className="my-pet-name txo" title={petInfo.name}>{petInfo.name}</span>
            <div className="pet-content">
                <ul className="pet-info">
                    <li>
                        {/* <div className="pet-info-star pet-info-img jy-f-l"></div> */}
                        <span className="jy-ml-10 jy-f-l">等级</span>
                        <i className="jy-f-r" id="user_pet">{petInfo.level}</i>
                    </li>
                    <li>
                        {/* <div className="pet-info-heart pet-info-img jy-f-l"></div> */}
                        <span className="jy-ml-10 jy-f-l">亲密值</span>
                        {/* <i className="jy-f-r" id="user_exp">{petInfo.honor}  {petInfo.honor_max}</i> */}
                        <div className="pet-info-count">{petInfo.honor} <i>{petInfo.honor_max}</i></div>
                        <div className="pet-info-line">
                          <div className="pet-info-lineup"></div>
                        </div>
                    </li>
                    <li>
                        {/* <div className="pet-info-grass pet-info-img jy-f-l"></div> */}
                        <span className="jy-ml-10 jy-f-l">饲料</span>
                        <i className="jy-f-r" id="user_food">{petInfo.food}</i>
                    </li>
                </ul>
                <div className="pet-skill-info">当前技能</div>
                <ul className="pet-now-skill">
                    <li className="now-skill-1">
                        <div className="skill-int">
                            <span className="text-red">金币光环</span><br />
                            出借获得金币加成<strong className="fz14 text-red">{petInfo.skill.coin}</strong>
                        </div>
                    </li>
                    <li className="now-skill-3">
                        <div className="skill-int">
                            <span className="text-red">羊之成长</span><br />
                            每日亲密度上限<strong className="fz14 text-red">{petInfo.skill.food}</strong>
                        </div>
                    </li>

                    <li className="now-skill-5">
                        <div className="skill-int">
                            <span className="text-red">羊光普照</span><br />
                            金币商城兑换折扣<strong className="fz14 text-red">{petInfo.skill.mall}</strong>折
                        </div>
                    </li>  
                    <li className="now-skill-2">
                        <div className="skill-int">
                            <span className="text-red">羊之召唤</span><br />
                            续期消耗<strong className="fz14 text-red">{petInfo.skill.red}</strong>金币
                        </div>
                    </li>          
                  </ul>
            </div>
         </div>

         <div className="my-sheep">
            <div className="my-sheep-img" style={{background: `url(https://img.jylc168.com/Pc/account/pet/pet_${petInfo.level || 1}.png) 0px 0px no-repeat`,marginLeft:'-1626px'}}></div>
         </div>

         <div className="my-pet-bottom">
            <ul className="pet-operate clearfix">
                <li className="pet-feed-1 pet-feed" onClick={this.show.bind(this)}></li>
                {/* <li className="pet-drink pet-drink"></li>
                <li className="pet-sleep"></li> */}
                {/* <li className="pet-play"></li> */}
                <li className="pet-play-1 pet-play" onClick={this.play.bind(this)}></li>
                <div className="pet-play-tips">
                  <dl>
                    <dt><b>萌宠玩耍规则：</b></dt>
                    <dd>（1）带您的萌宠出门旅行，将带回不同旅行纪念礼品及旅行地明信片。</dd>
                    <dd>（2）集6张不同的明信片可兑换1张50元囧羊券。</dd>
                  </dl>
                </div>
            </ul>
            <div className="pet-close-1"></div>
            <div className="pet-close-2"></div>
            <div className="pet-close-3"></div>
        </div>
        <div className="lunch-box" style={this.state.divStyles ===true?divStyle:null}>
          <div className="lunch-times">{nextTimeText}</div>
        </div>

        </div>
        <div className="u-title" style={{margin:'10px 0'}}>萌宠规则</div>
        <div className="pet-rule">
          <Tabs
            activeId={this.state.activeId}
            onChange={this.onTabChange}
          >
            <TabPanel
              tab="饲料获取"
              id="1"
            >
              <div className="pet-rule-con">
                宠物饲料可用于喂养平台的绵羊宠物，增加宠物和用户的亲密度，亲密度达到一定值可升级宠物等级 <br/>
                获取方式：
                <div className="pet-table">
                  <table>
                    <tbody>
                    <tr>
                      <th className="border-right">行为</th>
                      <th>获得数量</th>
                    </tr>
                    <tr>
                        <td>登录</td>
                        <td>2/次/时</td>
                    </tr>
                    <tr>
                        <td>签到</td>
                        <td>根据每日签到面板获取相应饲料</td>
                    </tr>
                    <tr>
                        <td>好友推荐</td>
                        <td>5/1人/次</td>
                    </tr>
                    <tr>
                        <td>出借平台项目</td>
                        <td>出借年化金额*0.1%</td>
                    </tr>
                    </tbody>
                  </table>
                </div>
                备注：（1）出借获取，(出借年化金额*0.1%),例如：出借6个月的项目10000元,即10000/2 *0.1% = 5饲料，出借获取饲料无上限 <br/>
（2）每4小时亲密值提升上限为 <span className="text-golden">50</span> <br/>
（3）登录获取饲料每日上限为 <span className="text-golden">30</span> <br/>
              </div>
            </TabPanel>
            <TabPanel
              tab="宠物升级"
              id="2"
            >
              <div className="pet-rule-con">
                <div className="pet-table">
                  <table>
                    <tbody>
                    <tr>
                        <td className="border-right">1级萌宠</td>
                        <td>注册送</td>
                    </tr>
                    <tr>
                        <td className="border-right">2级萌宠</td>
                        <td>亲密值达到400升级</td>
                    </tr>
                    <tr>
                        <td className="border-right">3级萌宠</td>
                        <td>亲密值达到1700升级</td>
                    </tr>
                    <tr>
                        <td className="border-right">4级萌宠</td>
                        <td>亲密值达到3800升级</td>
                    </tr>
                    <tr>
                        <td className="border-right">5级萌宠</td>
                        <td>亲密值达到13400升级</td>
                    </tr>
                    <tr>
                        <td className="border-right">6级萌宠</td>
                        <td>亲密值达到29600升级</td>
                    </tr>
                    <tr>
                        <td className="border-right">7级萌宠</td>
                        <td>亲密值达到59600升级</td>
                    </tr>
                    <tr>
                        <td className="border-right">8级萌宠</td>
                        <td>亲密值达到89600升级</td>
                    </tr>
                    <tr>
                        <td className="border-right">9级萌宠</td>
                        <td>亲密值达到118400升级</td>
                    </tr>
                    <tr>
                        <td className="border-right">10级萌宠</td>
                        <td>亲密值达到146800升级</td>
                    </tr>
                    </tbody>
                </table>
            </div>
              </div>
            </TabPanel>
            <TabPanel
              tab="宠物增益技能"
              id='3'
            >
              <div className="pet-rule-con">
                 <div className="pet-table pet-table-2">
                  <table>
                    <tbody>
                    <tr>
                        <td className="border-right">技能</td>
                        <td className="border-right" style={{width:'20%'}}>金币光环</td>
                        <td className="border-right">羊之召唤</td>
                        <td className="border-right">羊之成长</td>
                        <td className="border-right">羊光普照</td>
                    </tr>
                    <tr>
                        <td className="border-right">1级萌宠</td>
                        <td className="border-right">无</td>
                        <td className="border-right">无</td>
                        <td className="border-right">每4小时亲密值上限50</td>
                        <td>无</td>
                    </tr>
                    <tr>
                        <td className="border-right">2级萌宠</td>
                        <td className="border-right">出借获得金币加成5%</td>
                        <td className="border-right">无</td>
                        <td className="border-right">每4小时亲密值上限60</td>
                        <td>商城<span className="jy-text-orange">9.9</span>折</td>
                    </tr>
                    <tr>
                        <td className="border-right">3级萌宠</td>
                        <td className="border-right">出借获得金币加成10%</td>
                        <td className="border-right">无</td>
                        <td className="border-right">每4小时亲密值上限70</td>
                        <td>商城<span className="jy-text-orange">9.7</span>折</td>
                    </tr>
                    <tr>
                        <td className="border-right">4级萌宠</td>
                        <td className="border-right">出借获得金币加成15%</td>
                        <td className="border-right">续期消耗1000金币</td>
                        <td className="border-right">每4小时亲密值上限80</td>
                        <td>商城<span className="jy-text-orange">9.5</span>折</td>
                    </tr>
                    <tr>
                        <td className="border-right">5级萌宠</td>
                        <td className="border-right">出借获得金币加成20%</td>
                        <td className="border-right">续期消耗800金币</td>
                        <td className="border-right">每4小时亲密值上限90</td>
                        <td>商城<span className="jy-text-orange">9.2</span>折</td>
                    </tr>
                    <tr>
                        <td className="border-right">6级萌宠</td>
                        <td className="border-right">出借获得金币加成25%</td>
                        <td className="border-right">续期消耗500金币</td>
                        <td className="border-right">每4小时亲密值上限100</td>
                        <td>商城<span className="jy-text-orange">9</span>折</td>
                    </tr>
                    <tr>
                        <td className="border-right">7级萌宠</td>
                        <td className="border-right">出借获得金币加成30%</td>
                        <td className="border-right">续期消耗300金币</td>
                        <td className="border-right">无上限</td>
                        <td>商城<span className="jy-text-orange">8.5</span>折</td>
                    </tr>
                    <tr>
                        <td className="border-right">8级萌宠</td>
                        <td className="border-right">出借获得金币加成35%</td>
                        <td className="border-right">续期消耗100金币</td>
                        <td className="border-right">无上限</td>
                        <td>商城<span className="jy-text-orange">8</span>折</td>
                    </tr>
                    <tr>
                        <td className="border-right">9级萌宠</td>
                        <td className="border-right">出借获得金币加成40%</td>
                        <td className="border-right">续期消耗0金币</td>
                        <td className="border-right">无上限</td>
                        <td>商城<span className="jy-text-orange">7</span>折</td>
                    </tr>
                    <tr>
                        <td className="border-right">10级萌宠</td>
                        <td className="border-right">出借获得金币加成45%</td>
                        <td className="border-right">续期消耗0金币</td>
                        <td className="border-right">无上限</td>
                        <td>商城<span className="jy-text-orange">6</span>折</td>
                    </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </TabPanel>
            <TabPanel
              tab="宠物增益技能"
              id='4'
            >
              <div className="pet-rule-con">
                <div className="u-skill-font"><img src="https://img.jylc168.com/Pc/account/pet/skill_1.png" alt="" />金币光环：出借满标放款后，用户获得额外金币</div>
                <div className="u-skill-font"><img src="https://img.jylc168.com/Pc/account/pet/skill_2.png" alt="" />羊之召唤：召唤现金券续期功能</div>
                <div className="u-skill-font"><img src="https://img.jylc168.com/Pc/account/pet/skill_3.png" alt="" />羊之成长：增加每日亲密度上限</div>
                <div className="u-skill-font"><img src="https://img.jylc168.com/Pc/account/pet/skill_5.png" alt="" />羊光普照：金币商城兑换打折</div>
              </div>
            </TabPanel>
          </Tabs>
        </div>
        {/** --查看亲密记录-- -start **/}
        <div className="pet-mask"></div>
        <div className="record-frame record-frame-1">
            <div className="frame-close"></div>
            {/* <div className="hd">
                <span id="exp_dotprev" className="dotprev"></span>
                <span id="exp_dotnext" className="dotnext"></span>
            </div> */}
            <div className="record-frame-con">
                <ul className="record-frame-ul" id="exp_list">
                  <li className="record-frame-table">
                    <table>
                      <tbody>
                        {
                          (honorList || []).map((item, index) => (
                            <tr key={index}>
                              <td>{formatDs(item.time)}</td>
                              <td>+{item.food}</td>
                              <td>喂养</td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                    </li>
                </ul>
            </div>
        </div>
        {/** --查看亲密记录-- -end **/}
        {/** 亲密值排行 -start **/}
        <div className="record-frame record-frame-2">
            <div className="frame-close"></div>
            {/**
            <div className="hd">
                <span id="rank_dotprev" className="dotprev"></span>
                <span id="rank_dotnext" className="dotnext"></span>
            </div>**/}
            <div className="record-frame-con">
                <ul className="record-frame-ul" id="rank_list">
                  <li className="record-frame-table">
                    <table>
                      <tbody>
                        {
                          ranking.map((item, index) => (
                            <tr key={index}>
                              <td className="pet-first pet-rank"><span>{item.rank}</span></td>
                              <td>{item.name}</td>
                              <td>{item.honor}</td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                    </li>
                  </ul>
            </div>
        </div>
        {/** 亲密值排行 -end **/}

         {/** --我的明信片-- -start **/}
         <div className="record-frame record-frame-3">
            <div className="frame-close"></div>
            <div className="record-frame-con1 ">
              <ul className="clearfix">
                {
                  cardList.length === 0 ?
                  <div className="pet-text-c">你还没有明信片，快去让萌宠玩耍吧</div>:
                  <div>
                  {
                    cardList.map((item,index) =>(
                        <li key={index}>
                          <div className="postcard-count">{item.num}</div>
                          <div className="postcard">
                            <img src={`https://img.jylc168.com/V3/mine/pet1/area/${item.area}.jpg`} alt="" />
                          </div>
                        </li>
                    ))
                  }
                  </div>   
                }
              </ul>
            </div>
            <div>
              <button className="synthesis-btn pet-close-4" onClick={this.cardToRed.bind(this)} ></button>
            </div>
         </div>
  
        <div className="record-frame record-frame-4">
            <div className="frame-close"></div>
            <div className="record-frame-con2">
              <p>恭喜您获得<br />
                <b>50</b>元现金券
              </p>
              <span>（可在“账户中心-我的卡券”中查看）</span>
            </div>
        </div>
          {/** 我的明信片 -end **/}

        <div className="pet-mask1" style={{display:'none'}}></div>
        <div className="tips" style={{display:'none'}}>
          <div className="frame-close frame-close4">
              <img src="https://img.jylc168.com/Pc/account/pet/close.png" alt="" />
          </div>
          <div className="tips-btn">
                        
          </div>
        </div>
      </div>
    );
  }
}
export default Pet;
