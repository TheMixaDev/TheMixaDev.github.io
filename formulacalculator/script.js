const e = document.getElementById.bind(document);
let formManager = {
    currentForm: "mixadev.forms.Main",
    switchInProgress: false,
    switchForm: function(target) {
        if(this.switchInProgress) return;
        this.switchInProgress = true;
        e(this.currentForm).style.opacity = 0;
        e(target).style.display = "block";
        setTimeout(function(){
            e(target).style.opacity = 1;
            setTimeout(function(){
                e(formManager.currentForm).style.display = "none";
                formManager.clean(formManager.currentForm);
                formManager.currentForm = target;
                formManager.switchInProgress = false;
            },450);
        },50);
    },
    showResult: function(form, result) {
        e(`mixadev.forms.calculator.${form}.result.number`).innerHTML = result;
        e(`mixadev.forms.calculator.${form}.result.label`).style.opacity = 1;
    },
    clean: function(form) {
        for(element of e(form).querySelectorAll('*[id]')) {
            if(element.tagName === "INPUT")
                element.value = "";
            if(element.tagName === "SPAN" && !element.id.includes("enumerator"))
                element.style.opacity = 0;
        }
        visuals.update("Bayes");
    }
};
const visuals = {
    prefab: {
        AMOUNT: `<br>{NUM}-ое стадо: <input type="number" placeholder="0" style="width: 50px;" id="mixadev.forms.calculator.Bayes.enumerator.{NUM}.amount.value" onchange="visuals.update('{PARENT}')" onfocus="visuals.update('{PARENT}')"> особей`,
        PERCENT: `<br>{NUM}-ое стадо: <input type="number" placeholder="0" style="width: 50px;" id="mixadev.forms.calculator.Bayes.enumerator.{NUM}.percent.value" onchange="visuals.update('{PARENT}')" onfocus="visuals.update('{PARENT}')"> %`
    },
    update: function(parent) {
        let lastNotEmptyAmount = 0;
        let lastAmount = 1;
        let lastNotEmptyPercent = 0;
        let lastPercent = 1;
        for(element of e(`mixadev.forms.calculator.${parent}.amount`).querySelectorAll('*[id]')) {
            lastAmount = element.id.split(".")[5]*1;
            if(element.id.includes(".value") && element.value.length > 0)
                lastNotEmptyAmount = lastAmount*1;
        }
        for(element of e(`mixadev.forms.calculator.${parent}.percent`).querySelectorAll('*[id]')) {
            lastPercent = element.id.split(".")[5]*1;
            if(element.id.includes(".value") && element.value.length > 0)
                lastNotEmptyPercent = lastPercent*1;
        }
        let lastNotEmpty = Math.max(lastNotEmptyAmount, lastNotEmptyPercent);
        //if(lastPercent != lastAmount) alert("Something got wrong bro");
        if(lastAmount > lastNotEmpty+1) {
            for(let i=lastNotEmpty+2;i<=lastAmount;i++) {
                for(element of document.querySelectorAll('*[id]')) {
                    if(element.id.startsWith(`mixadev.forms.calculator.${parent}.enumerator.`+i) && element.id.includes(".element"))
                        element.remove();
                }
            }
        } else if(lastAmount == lastNotEmpty) {
            let amountElement = document.createElement("span");
            amountElement.id = `mixadev.forms.calculator.${parent}.enumerator.${lastAmount+1}.amount.element`;
            amountElement.innerHTML = visuals.prefab.AMOUNT.replaceAll("{NUM}",lastAmount+1).replaceAll("{PARENT}",parent);
            e(`mixadev.forms.calculator.${parent}.amount`).appendChild(amountElement);
            let percentElement = document.createElement("span");
            percentElement.id = `mixadev.forms.calculator.${parent}.enumerator.${lastAmount+1}.percent.element`;
            percentElement.innerHTML = visuals.prefab.PERCENT.replaceAll("{NUM}",lastAmount+1).replaceAll("{PARENT}",parent);
            e(`mixadev.forms.calculator.${parent}.percent`).appendChild(percentElement)
        }
    },
};
const math = {
    factorial: function(n) {
        if (n <= 1) {
            return 1;
        }
        return n * this.factorial(n - 1);
    }
}
const calculator = {
    Bernul: function() {
        let n = Math.floor(e("mixadev.forms.calculator.Bernul.total").value*1);
        let k = Math.floor(e("mixadev.forms.calculator.Bernul.ill").value*1);
        let percent = e("mixadev.forms.calculator.Bernul.percent").value*1;
        n = n>=0?n:0;
        k = k>=0?k:0;
        let p = percent<=100?percent/100:1;
        let q = 1-p;
        let C = math.factorial(n)/(math.factorial(k)*math.factorial(n-k));
        let result = C*Math.pow(p,k)*Math.pow(q,n-k);
        result = Math.round(result*100000)/1000;
        formManager.showResult("Bernul", result+"%");
    },
    Bayes: function() {
        let A = [];
        let C = [];
        let P = [];
        for(element of e("mixadev.forms.calculator.Bayes.amount").querySelectorAll('*[id]')) {
            if(element.id.includes(".value")) {
                A.push(0);
                P.push(null);
                if(element.value.length > 0) {
                    A[A.length-1] = Math.floor(element.value*1);
                    A[A.length-1] = A[A.length-1] >= 0 ? A[A.length-1] : 0;
                }
            }
        }
        for(element of e("mixadev.forms.calculator.Bayes.percent").querySelectorAll('*[id]')) {
            if(element.id.includes(".value")) {
                C.push(0);
                if(element.value.length > 0) {
                    C[C.length-1] = Math.floor(element.value*1)/100;
                    C[C.length-1] = C[C.length-1] <= 1 ? C[C.length-1] : 1;
                }
            }
        }
        A.pop();
        C.pop();
        P.pop();
        B = A.reduce((partialSum, a) => partialSum + a, 0);
        for(let i in P) {
            P[i] = A[i] / B;
        }
        let temp = e("mixadev.forms.calculator.Bayes.index").value;
        if(temp.length < 1 || temp*1 < 1 || temp*1 > A.length)
            e("mixadev.forms.calculator.Bayes.index").value = A.length;
        k = e("mixadev.forms.calculator.Bayes.index").value*1;
        let E = 0;
        for(let i in A) {
            E += P[i] * C[i];
        }
        let result = P[k-1]*C[k-1]/E;
        result = Math.round(result*100000)/1000;
        formManager.showResult("Bayes", result+"%");
    }
};