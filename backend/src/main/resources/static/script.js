async function loadTasks(){

let res = await fetch("/api/todos");
let data = await res.json();

let list = document.getElementById("taskList");
list.innerHTML="";

data.forEach(todo => {

let li = document.createElement("li");

let span = document.createElement("span");
span.className="task";
span.innerText=todo.task;

if(todo.completed){
span.classList.add("completed");
}

span.onclick=()=>toggleComplete(todo);

let del = document.createElement("button");
del.innerText="Delete";
del.className="delete-btn";
del.onclick=()=>deleteTask(todo.id);

li.appendChild(span);
li.appendChild(del);

list.appendChild(li);

});

}

async function addTask(){

let input=document.getElementById("taskInput");
let task=input.value;

if(task==="") return;

await fetch("/api/todos",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
task:task,
completed:false
})
});

input.value="";
loadTasks();
}

async function deleteTask(id){

await fetch(`/api/todos/${id}`,{
method:"DELETE"
});

loadTasks();
}

async function toggleComplete(todo){

await fetch(`/api/todos/${todo.id}`,{
method:"PUT",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
...todo,
completed:!todo.completed
})
});

loadTasks();
}

loadTasks();