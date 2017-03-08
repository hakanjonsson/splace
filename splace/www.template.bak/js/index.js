
/* activate localStorage */
var localStore = window.localStorage;

/* surveyQuestion Model (This time, written in "JSON" format to interface more cleanly with Mustache) */
/* This is used to input the questions you would like to ask in your experience sampling questionnaire*/
var surveyQuestions = [
/*number each question in this variable starting from 0, so it is easy to reference question items when setting up question logic*/
                       /*0*/
                       {
                       variableName: "variableName",
                       questionPrompt: "Exact question wording",
                       minResponse: 0,
                       maxResponse: 1,
//                       minResponse: /*minimum numerical value of the scale or multiple choice option*/,
//                       maxResponse: /*maximum numerical value of the scale or multiple choice option*/,
	                       labels: [
	                                {label: "No"},
	                                {label: "Yes"}
	                                ],
                       
//                       labels: [
//                                {label: "label for minimum numerical value of scale or first option for multiple choice question"},
//                                {label: "label for maximum numerical value of scale or second option for multiple choice question"}
//                                ],
                       },
                       
                       /*1*/
                       /*snooze question, where selecting "No" snoozes the app for a predetermined amount of time*/
                       {
                       variableName: "snooze",
                       questionPrompt: "Are you able to take the survey now?",
                       minResponse: 0,
                       maxResponse: 1,
                       labels: [
                                {label: "No"},
                                {label: "Yes"}
                                ],
                       },
                       
                       /*2*/
                       /*multiple choice question with more than 2 options*/
                       {
                       variableName: "variableName",
                       questionPrompt: "Exact question wording",
                       minResponse: 0 /*minimum numerical value of multiple choice option*/,
                       maxResponse: 1 /*maximum numerical value of multiple choice option*/,
                       labels: [
                                {label: "label for first multiple choice option"},
                                {label: "label for second multiple choice option"},
                                {label: "label for third multiple choice option"},
                                {label: "label for fourth multiple choice option"},
                                ],
                       },
                       
                       /*3*/
                       /*format of open-ended*/ 
                       {
                       variableName: "variableName",
                       questionPrompt: "Exact question wording",
                       },
                       
                       /*4*/
                       /*format of descending rating scale*/
                       {
                       variableName: "variableName",
                       questionPrompt: "Exact question wording",
                       minResponse: 0 /*minimum numerical value of rating scale*/,
                       maxResponse: 1 /*maximum numerical value of rating scale*/,
                       labels: [
                       			{label: "label for higher scale point"},
                       			{label: "label for next largest scale point"},
                       			{label: "label for next largest scale point"},
                       			{label: "label for midpoint of scale point"},
                                {label: "label for next scale point"},
                                {label: "label for next smallest scale point"},
                                {label: "label for smallest scale point"},
                                ]
                       },
                       /*5*/
                       /*format for regular rating scale*/
                       {
                       variableName: "variableName",
                       questionPrompt: "Exact question wording",
                       minResponse: 0 /*minimum numerical value of rating scale*/,
                       maxResponse: 1 /*maximum numerical value of rating scale*/,
                       labels: [
                                {label: "label for lowest value of rating scale"},
                                {label: "label for next lowest value of rating scale"},
                                {label: "label for next lowest value of rating scale"},
                                {label: "label for midpoint of scale"},
                                {label: "label for next highest value of rating scale"},
                                {label: "label for next highest value of rating scale"},
                                {label: "label for highest value of rating scale"},
                                ]
                       },
                       /*input additional questions*/
                       ];

/*These are the messages that are displayed at the end of the questionnaire*/
var lastPage = [
				/*input your last-page message*/
                {
                message: "End of questionnaire message"
                },
                /*input snooze last-page message*/
                {
                message: "Snooze message"
                }
                ];

/*Questions to set up participant notifications so that notifications are customized to participant's schedule*/                
var participantSetup = [
                        {
							variableName: "participant_id",
							questionPrompt: "Please enter your participant ID:"
                        },
							{variableName: "weekdayWakeHour",
							questionPrompt: "What time are you normally awake on weekdays (hour)? (e.g., 8 for 8AM)"
                        },
							{variableName: "weekdayWakeMinute",
							questionPrompt: "What time are you normally awake on weekdays (minutes)? (e.g., 00 for 8:00)"
                        },                        
							{variableName: "weekdayDinnerHour",
							questionPrompt: "What time do you normally eat dinner on weekdays (hour)? (e.g., 18 for 6PM)"
                        },
							{variableName: "weekdayDinnerMinute",
							questionPrompt: "What time do you normally eat dinner on weekdays (minutes)? (e.g., 30 for 18:30)"
                        },                        
							{variableName: "weekendWakeHour",
							questionPrompt: "What time are you normally awake on weekends (hour)? (e.g., 10 for 10AM)"
                        },
							{variableName: "weekendWakeMinute",
							questionPrompt: "What time are you normally awake on weekends (minutes)? (e.g., 00 for 10:00)"
                        },                        
							{variableName: "weekendDinnerHour",
							questionPrompt: "What time do you normally eat dinner on weekends (hour)? (e.g., 19 for 7PM)"
                        },
							{variableName: "weekendDinnerMinute",
							questionPrompt: "What time do you normally eat dinner on weekends (minutes)? (e.g., 00 for 19:00)"
                        }                        
                    ];

/*Populate the view with data from surveyQuestion model*/
// Making mustache templates
var questionTmpl = "<p>{{questionPrompt}}</p><ul>{{{buttons}}}</ul>";
var buttonTmpl = "<li><button id='{{id}}' value='{{value}}'>{{label}}</button></li>";
var textTmpl = "<li><textarea cols=50 rows=5 id='{{id}}'></textarea></li><li><button type='submit' value='Enter'>Enter</button></li>";
var lastPageTmpl = "<h3>{{message}}</h3>";
//if you have a response variable that determines which questionnaire branch participant's complete
//This can be a question about whether or not the phenomenon of interest occurred or not
var comparisonResponse;
//This uniqueKey is for iOS version
//the uniqueKey tags the set of responses from one questionnaire so that the compliance script can determine whether not a participant
//has completed a sufficient number of questionnaires for the day.
//The unique key also helps organize the data when preparing for data analysis
var uniqueKey = new Date().getTime();

var app = {
    // Application Constructor
initialize: function() {
    this.bindEvents();
},
    // Bind Event Listeners
bindEvents: function() {
    document.addEventListener("deviceready", this.onDeviceReady, false);
    document.addEventListener("resume", this.onResume, false);
    document.addEventListener("pause", this.onPause, false);
    document.addEventListener("receivedLocalNotification", this.onReceivedLocalNotification, false);
},
//these functions tell the app what to do at different stages of running
onDeviceReady: function() {
    app.init();
},

onResume: function() {app.sampleParticipant();},

onPause: function() {app.pauseEvents();},

onReceivedLocalNotification:function(event) {
    var activeMessage;
    if ( event.active === true ) {
        activeMessage = ' while app was active';
    } else {
        activeMessage = ' while app was inactive';
    }
    var message = "Received local notificationId: " + event.notificationId +activeMessage;
    console.log(message);
    navigator.notification.alert(message);
},


//Beginning our app functions
/* The first function is used to specify how the app should display the various questions. You should note which questions 
should be displayed using which formats before customizing this function*/
renderQuestion: function(question_index) {
    //First load the correct question from the JSON database
	var question;
	//change X to the number of questions in the participant setup
	//for example, if there are 8 questions in the participant setup, then X = -8
    if (question_index <= -1) {question = participantSetup[question_index+2];}
    else {question = surveyQuestions[question_index];}
    //Now populate the view for this question, depending on whether it uses buttons or textarea
    /*This next statement is a conditional statement saying that questions that are not equal to this number should be displayed as 
    *rating scales (i.e., small numbers at the top of the screen and larger numbers at the bottom of the screen). 
    *Thus, question numbers included here should be open-ended questions and descending rating scale items
    replace these numbers with the appropriate question index number*/
    
 	if (question_index > -1 && question_index !== 4 && question_index !==9 && question_index !== 10 && question_index !==12 
    && question_index !==18 && question_index !==20 && question_index !==21 && question_index !==22 && question_index !==23 
    && question_index !==24 && question_index !==25 && question_index !==29 && question_index !== 47 && question_index < 52) {
            question.buttons = "";
            var label_count = 0;
            for (var i = question.minResponse; i <= question.maxResponse; i++) {
                var label = question.labels[label_count++].label;
                question.buttons += Mustache.render(buttonTmpl, {
                                                    id: question.variableName+i,
                                                    value: i,
                                                    label: label
                                                    }
                                                    );
            }
            $("#question").html(Mustache.render(questionTmpl, question));
            $("#question ul li button").click(function(){ app.recordResponse(this, question_index)});
        }
    //This next conditional statement says that questions that are equal to any of these numbers should be displayed as a descending
    //rating scale (e.g., positive numbers on top; negative numbers on the bottom).     
    else if (question_index == 10 || question_index == 21 || question_index == 22 || question_index == 23 || 
    question_index == 24 || question_index == 25 || question_index >= 52) {
        	question.buttons = "";
            var label_count = 0;
            for (var j = question.maxResponse; j >= question.minResponse; j--) {
                var label = question.labels[label_count++].label;
                question.buttons += Mustache.render(buttonTmpl, {
                                                    id: question.variableName+j,
                                                    value: j,
                                                    label: label
                                                    }
                                                    );
            }
            $("#question").html(Mustache.render(questionTmpl, question));
            $("#question ul li button").click(function(){ app.recordResponse(this, question_index)});      
        }
	//This final statement says that any other question that does not meet the previous two conditional statements should be 
	//displayed as an open-ended question
    else {
            question.buttons = Mustache.render(textTmpl, {id: question.variableName+"1"});
            $("#question").html(Mustache.render(questionTmpl, question));
            $("#question ul li button").click(function(){ app.recordResponse($("textarea"), question_index)});
        }
    },
    
renderLastPage: function(pageData, question_index) {
    $("#question").html(Mustache.render(lastPageTmpl, pageData));
    //snooze function logic
    //this conditional statement executes the snooze function when the snooze message is shown
    /*if ( question_index == 1 ) {
        app.snoozeNotif();
        localStore.snoozed = 1;
    }*/
 	app.saveDataLastPage();
},

/* Initialize the whole thing */
init: function() {
	//change X to the number of questions in the participant setup
	//for example, if there are 8 questions in the participant setup, then X = -8
    if (!localStore.participant_id) {app.renderQuestion(2);}
    else {
        app.renderQuestion(0);
    }
    localStore.snoozed = 0;
    
},
  
/* Record User Responses */    
recordResponse: function(button, count) {
//     //Record date (create new date object)
//     var datestamp = new Date();
//     var year = datestamp.getFullYear(), month = datestamp.getMonth(), day=datestamp.getDate(), hours=datestamp.getHours(), minutes=datestamp.getMinutes(), seconds=datestamp.getSeconds();
//     //Record value of text field
		// specify which questions 
//     var response, currentQuestion, uniqueRecord;
		//Specify which questions are open-ended, so that the app will record the response as a string
//     if (count <= -1 || count == 4 || count == 9 || count == 12 || count == 18 || count == 20 || count == 29 
//     	|| count == 47) {
//         response = button.val();
//         currentQuestion = button.attr('id').slice(0,-1);
//     }
//     //Record value of clicked button
//     else {
//         response = button.value;
//         //Create a unique identifier for this response
//         currentQuestion = button.id.slice(0,-1);
//     }

//     if (count <= -1) {uniqueRecord = currentQuestion}
//     else {uniqueRecord = uniqueKey + "_" + currentQuestion + "_" + year + "_" + month + "_" + day + "_" + hours + "_" + minutes + "_" + seconds;}
//     //Save this to local storage
//     localStore[uniqueRecord] = response;
//		


//		/*Question Logic Statements*/
//     if (count == 0) {comparisonResponse = response;}
//     //Identify the next question to populate the view
//     if (count == -1){app.firstSurveys();app.renderLastPage(lastPage[0], count);app.scheduledNotifs();}
//     else if (count == 1 && response == 0) {app.renderLastPage(lastPage[1], count);}
//     else if (count == 3 & response < 10 && comparisonResponse == 0) {app.renderQuestion(28);}
//     else if (count == 3 & response < 10 && comparisonResponse == 1) {app.renderQuestion(5);}
//     else if (count == 3 && response == 10) {app.renderQuestion(4);}
//     else if (count == 4 && comparisonResponse == 0) {app.renderQuestion(28);}
//     else if (count == 4 && comparisonResponse == 1) {app.renderQuestion(5);}
//     else if (count == 6 & response < 6) {app.renderQuestion(10);}
//     else if (count == 6 && response == 6) {app.renderQuestion(7);}
//     else if (count == 6 && response ==7) {app.renderQuestion(8);}
//     else if (count == 6 && response ==8) {app.renderQuestion(9);}
//     else if (count == 7 && response < 4) {app.renderQuestion(10);}
//     else if (count == 7 && response ==4) {app.renderQuestion(9);}
//     else if (count == 8 && response < 7) {app.renderQuestion(10);}
//     else if (count == 8 && response ==7) {app.renderQuestion(9);}
//     else if (count == 11 && response < 12) {app.renderQuestion(13);}
//     else if (count == 11 && response ==12) {app.renderQuestion(12);}
//     else if (count == 15 & response < 5) {app.renderQuestion(19);}
//     else if (count == 15 && response ==5) {app.renderQuestion(16);}
//     else if (count == 15 & response ==6) {app.renderQuestion(17);}
//     else if (count == 15 & response ==7) {app.renderQuestion(18);}
//     else if (count == 16 && response < 5) {app.renderQuestion(19);}
//     else if (count == 16 && response ==5) {app.renderQuestion(18);}
//     else if (count == 17 && response < 8) {app.renderQuestion(19);}
//     else if (count == 17 && response ==8) {app.renderQuestion(18);}
//     else if (count == 19 && response < 5) {app.renderQuestion(21);}
//     else if (count == 19 && response == 5) {app.renderQuestion(20);}
//     else if (count == 27 && response == 1) {app.renderQuestion(5);}
//     else if (count == 27 && response == 0) {app.renderQuestion(52);}
//     else if (count == 31 && response == 0) {app.renderQuestion(33);}
//     else if (count == 31 && response == 1) {app.renderQuestion(32);}
//     else if (count == 31 && response == 2) {app.renderQuestion(34);}
//     else if (count == 32 && response < 8) {app.renderQuestion(34);}
//     else if (count == 34 && response == 0) {app.renderQuestion(35);}
//     else if (count == 34 && response == 1) {app.renderQuestion(38);}    
//     /*else*/ if (count < surveyQuestions.length-1) {app.renderQuestion(count+1);}
//     else if (count == -1) {app.renderLastPage(lastPage[0], count);}
//     else {app.renderLastPage(lastPage[0], count);};
},
    
    /* Prepare for Resume and Store Data */
    /* Time stamps the current moment to determine how to resume */
pauseEvents: function() {
    localStore.pause_time = new Date().getTime();
    app.saveData();
},
      
sampleParticipant: function() {
    var current_moment = new Date();
    var current_time = current_moment.getTime();
    if ((current_time - localStore.pause_time) > 600000 || localStore.snoozed == 1) {
        localStore.snoozed = 0;
        app.renderQuestion(0);
    }
    app.triggeredNotifs();
    app.saveData();
},

saveDataLastPage:function() {
//     $.ajax({
//            type: 'post',
//            url: 'http://www.experiencesampler.com/testingdata/data_collector.cgi',
//            data: localStore,
//            crossDomain: true,
//            success: function (result) {
//            var pid = localStore.participant_id, snoozed = localStore.snoozed, idsScheduled = localStore.idsScheduled;
//            localStore.clear();
//            localStore.participant_id = pid;
//            localStore.snoozed = snoozed;
//            localStore.idsScheduled = idsScheduled;
//            navigator.notification.alert("Data Sent Successfully", function(){}, "", "");
//            },
//            error: function (request, error) {console.log(error);navigator.notification.alert("Error Sending Data. Please check your Internet Connection.",function(){}, "", "");}
//            });
},
saveData:function() {
//     $.ajax({
//            type: 'post',
//            url: 'http://www.experiencesampler.com/testingdata/data_collector.cgi',
//            data: localStore,
//            crossDomain: true,
//            success: function (result) {
//            var pid = localStore.participant_id, snoozed = localStore.snoozed, idsTriggered = localStore.idsTriggered;
//            localStore.clear();
//            localStore.participant_id = pid;
//            localStore.snoozed = snoozed;
//            localStore.idsTriggered = idsTriggered;
//            //navigator.notification.alert("Data Sent Successfully", function(){}, "", "");
//            },
//            error: function (request, error) {console.log(error);/*navigator.notification.alert("Error Sending Data. Please relaunch the app when you are connected to the Internet again.",function(){}, "", "");*/}
//            });
},
    
    // Local Notifications Javascript
firstSurveys:function() {
//     window.plugin.backgroundMode.enable();
//     var interval1, interval2, interval3, interval4, interval5, interval6, interval7, interval8, dinnerInterval;
//     var a, b, c, d, e, f, g;
//     var date1, date2, date3, date4, date5, date6, date7, date8;
//     var currentMaxHour, currentMaxMinute, currentMinHour, currentMinMinute, nextMinHour, nextMinMinute;
//     var dateObject = new Date();
//     var now = dateObject.getTime();
//     var dayOfWeek = dateObject.getDay(), currentHour = dateObject.getHours(), currentMinute = dateObject.getMinutes();
//     var nightlyLag, currentLag, maxInterval;
//     for (i = 0; i < 7; i++)
//     {
//         var alarmDay = dayOfWeek + 1 + i;
//         if (alarmDay > 6) {alarmDay = alarmDay-7;}
//         //enter time weekendDinnerTime hour and then enter weekendDinnerTime minute
//         if (alarmDay == 0 || alarmDay == 6) {
//             currentMaxHour = localStore.weekendDinnerHour;
//             currentMaxMinute = localStore.weekendDinnerMinute;
//             currentMinHour = localStore.weekendWakeHour;
//             currentMinMinute = localStore.weekendWakeMinute;
//             if (alarmDay == 0) {
//                 nextMinHour = localStore.weekdayWakeHour;
//                 nextMinMinute = localStore.weekdayWakeMinute;
//             }
//             else {
//                 nextMinHour = localStore.weekendWakeHour;
//                 nextMinMinute = localStore.weekendWakeMinute;
//             }
//             currentLag = (((((24 - parseInt(currentHour) + parseInt(localStore.weekendWakeHour))*60) - parseInt(currentMinute) + parseInt(localStore.weekdayWakeMinute))*60)*1000);
//         }
//         else {
//             currentMaxHour = localStore.weekdayDinnerHour;
//             currentMaxMinute = localStore.weekdayDinnerMinute;
//             currentMinHour = localStore.weekdayWakeHour;
//             currentMinMinute = localStore.weekdayWakeMinute;
//             if (alarmDay == 5) {
//                 nextMinHour = localStore.weekendWakeHour;
//                 nextMinMinute = localStore.weekendWakeMinute;
//             }
//             else {
//                 nextMinHour = localStore.weekdayWakeHour;
//                 nextMinMinute = localStore.weekdayWakeMinute;
//             }
//             currentLag = (((((24 - parseInt(currentHour) + parseInt(localStore.weekdayWakeHour))*60) - parseInt(currentMinute) + parseInt(localStore.weekdayWakeMinute))*60)*1000);
//         }
//         
//         //nightlyLag calculates how much time between now and next wakeup hour
//         if (alarmDay == 5 || alarmDay == 0){
//             nightlyLag = currentLag;
//         }
//         else {
//             nightlyLag= (((((24 - parseInt(currentHour) + parseInt(nextMinHour))*60) - parseInt(currentMinute) + parseInt(nextMinMinute))*60)*1000);
//         }
//         //number of milliseconds between wakeup time and dinner time
//         maxInterval = (((((parseInt(currentMaxHour) - parseInt(currentMinHour))*60) + parseInt(currentMaxMinute) - parseInt(currentMinMinute))*60)*1000);
//         interval1 = (parseInt(nightlyLag) + ((parseInt(Math.round(Math.random()*3600)+3600))*1000) + ((parseInt(86400)*parseInt(i))*1000));
//         interval2 = (interval1 + ((parseInt(Math.round(Math.random()*3600)+3600))*1000));
//         interval3 = (interval2 + ((parseInt(Math.round(Math.random()*3600)+3600))*1000));
//         interval4 = (interval3 + ((parseInt(Math.round(Math.random()*3600)+3600))*1000));
//         interval5 = (interval4 + ((parseInt(Math.round(Math.random()*3600)+3600))*1000));
//         interval6 = (interval5 + ((parseInt(Math.round(Math.random()*3600)+3600))*1000));
//         interval7 = (interval6 + ((parseInt(Math.round(Math.random()*3600)+3600))*1000));
//         dinnerInterval = parseInt(currentLag) + parseInt(maxInterval) + (parseInt(86400000)*parseInt(i));
//         interval8 = (dinnerInterval + ((parseInt(Math.round(Math.random()*3600)+3600))*1000));
//         
//         a = 101+(parseInt(i)*100);
//         b = 102+(parseInt(i)*100);
//         c = 103+(parseInt(i)*100);
//         d = 104+(parseInt(i)*100);
//         e = 105+(parseInt(i)*100);
//         f = 106+(parseInt(i)*100);
//         g = 107+(parseInt(i)*100);
//         h = 108+(parseInt(i)*100);
//         
//         date1 = new Date(now + interval1);
//         date2 = new Date(now + interval2);
//         date3 = new Date(now + interval3);
//         date4 = new Date(now + interval4);
//         date5 = new Date(now + interval5);
//         date6 = new Date(now + interval6);
//         date7 = new Date(now + interval7);
//         date8 = new Date(now + interval8);
//         
//         window.plugin.notification.local.add({icon: 'ic_launcher', id: a, date: date1, message: 'Time for your next Diary Survey!', title: 'Diary Survey', autoCancel: true});
//         window.plugin.notification.local.add({icon: 'ic_launcher', id: b, date: date2, message: 'Time for your next Diary Survey!', title: 'Diary Survey', autoCancel: true});
//         window.plugin.notification.local.add({icon: 'ic_launcher', id: c, date: date3, message: 'Time for your next Diary Survey!', title: 'Diary Survey', autoCancel: true});
//         window.plugin.notification.local.add({icon: 'ic_launcher', id: d, date: date4, message: 'Time for your next Diary Survey!', title: 'Diary Survey', autoCancel: true});
//         window.plugin.notification.local.add({icon: 'ic_launcher', id: e, date: date5, message: 'Time for your next Diary Survey!', title: 'Diary Survey', autoCancel: true});
//         window.plugin.notification.local.add({icon: 'ic_launcher', id: f, date: date6, message: 'Time for your next Diary Survey!', title: 'Diary Survey', autoCancel: true});
//         window.plugin.notification.local.add({icon: 'ic_launcher', id: h, date: date8, message: 'Time for your nightly online survey! Please check your email!', title: 'Diary Survey', autoCancel: true});
//         if (interval7 < dinnerInterval) {
//             window.plugin.notification.local.add({icon: 'ic_launcher', id: g, date: date7, message: 'Time for your next Diary Survey!', subtitle: 'Diary Survey', autoCancel: true});
//         }
//         localStore['notification1_'+ i] = localStore.participant_id + "_" + a + "_" + date1;
//         localStore['notification2_'+ i] = localStore.participant_id + "_" + b + "_" + date2;
//         localStore['notification3_'+ i] = localStore.participant_id + "_" + c + "_" + date3;
//         localStore['notification4_'+ i] = localStore.participant_id + "_" + d + "_" + date4;
//         localStore['notification5_'+ i] = localStore.participant_id + "_" + e + "_" + date5;
//         localStore['notification6_'+ i] = localStore.participant_id + "_" + f + "_" + date6;
//         localStore['notification8_'+ i] = localStore.participant_id + "_" + h + "_" + date8;
//         if (interval7 < dinnerInterval) {
//             localStore['notification7_'+ i] = localStore.participant_id + "_" + g + "_" + date7;
//             }
//     }
},

//this function records the ids of the notifications that have been scheduled
scheduledNotifs: function() {
// 	var idsScheduled = localStore.idsScheduled;
//     window.plugin.notification.local.getScheduledIds(function (scheduledIds) {alert('Scheduled IDs: ' + scheduledIds.join(' ,')); localStore.idsScheduled = localStore.participant_id + "_" + "Scheduled_IDs:" + "_" + scheduledIds.join('_');
//                                                      });
},

//this function does not currently work with Android 
//this function records whether a notification has fired but not been responded to (i.e., clicked on) by the participant
triggeredNotifs: function() {
//     var idsTriggered = localStore.idsTriggered;
//     var datestamp = new Date();
//     var year = datestamp.getFullYear(), month = datestamp.getMonth(), day=datestamp.getDate(), hours=datestamp.getHours(), minutes=datestamp.getMinutes(), seconds=datestamp.getSeconds();
//     window.plugin.notification.local.getTriggeredIds(function (triggeredIds){localStore.idsTriggered = localStore.participant_id + "_" + "Triggered_IDs" + "_" + year + "_" + month + "_" + day + "_" + hours + "_" + minutes + "_" + seconds + "_" + triggeredIds.join('_');});
},

snoozeNotif:function() {
//     var now = new Date().getTime(), snoozeDate = new Date(now + 600*1000);
//     var id = '99';
//     window.plugin.notification.local.add({
//                                          icon: 'ic_launcher',
//                                          id: id,
//                                          title: 'Diary Survey',
//                                          message: 'Please complete survey now!',
//                                          autoCancel: true,
//                                          date: snoozeDate,
//                                          });
}
};
