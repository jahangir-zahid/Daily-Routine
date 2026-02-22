let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let weeklyData = JSON.parse(localStorage.getItem("weekly")) || [0,0,0,0,0,0,0];
let historyLog = JSON.parse(localStorage.getItem("history")) || {};

function saveAll(){
    localStorage.setItem("tasks",JSON.stringify(tasks));
    localStorage.setItem("weekly",JSON.stringify(weeklyData));
    localStorage.setItem("history",JSON.stringify(historyLog));
}

function addTask(){
    const name=document.getElementById("taskInput").value.trim();
    const time=parseInt(document.getElementById("timeInput").value);
    if(!name || !time) return;

    tasks.push({name,time,completed:false});
    render();
}

function toggleTask(i){
    tasks[i].completed=!tasks[i].completed;
    render();
}

function deleteTask(i){
    tasks.splice(i,1);
    render();
}

function render(){
    const list=document.getElementById("taskList");
    list.innerHTML="";
    let total=0,completed=0;

    tasks.forEach((t,i)=>{
        total+=t.time;
        if(t.completed) completed+=t.time;

        const li=document.createElement("li");

        const span=document.createElement("span");
        span.innerText=`${t.name} - ${t.time} min`;
        if(t.completed) span.classList.add("completed");
        span.onclick=()=>toggleTask(i);

        const del=document.createElement("button");
        del.innerText="X";
        del.onclick=()=>deleteTask(i);

        li.appendChild(span);
        li.appendChild(del);
        list.appendChild(li);
    });

    let percent=total>0?((completed/total)*100).toFixed(1):0;

    document.getElementById("totalTime").innerText=total;
    document.getElementById("completedTime").innerText=completed;
    document.getElementById("productivity").innerText=percent+"%";
    document.getElementById("progressBar").style.width=percent+"%";

    weeklyData[new Date().getDay()]=percent;
    historyLog[new Date().toISOString().split("T")[0]]=percent;

    chart.data.datasets[0].data=weeklyData;
    chart.update();

    saveAll();
}

function toggleDarkMode(){
    document.body.classList.toggle("dark");
}

function downloadPDF(){
    const {jsPDF}=window.jspdf;
    const doc=new jsPDF();
    doc.text("Daily Productivity Report",20,20);
    doc.text("Total Tasks: "+tasks.length,20,30);
    doc.text("Productivity: "+document.getElementById("productivity").innerText,20,40);
    doc.save("Productivity_Report.pdf");
}

function enableReminder(){
    if(Notification.permission==="granted"){
        new Notification("Reminder: Complete your daily tasks!");
    }else{
        Notification.requestPermission();
    }
}

document.getElementById("calendarDate").addEventListener("change",function(){
    const date=this.value;
    const data=historyLog[date] || "No data";
    document.getElementById("calendarData").innerText=
        "Productivity: "+data+"%";
});

const ctx=document.getElementById("weeklyChart").getContext("2d");
const chart=new Chart(ctx,{
    type:"line",
    data:{
        labels:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
        datasets:[{
            data:weeklyData,
            borderColor:"#4A7C7C",
            fill:false,
            tension:0.3
        }]
    },
    options:{plugins:{legend:{display:false}}}
});

render();