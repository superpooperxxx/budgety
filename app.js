// BUDGET CONTROLLER
var budgetContoller = (function(){
        var Expense = function(id, type, description, value, perc){
                this.ID = id;
                this.type = type;
                this.description = description;
                this.value = value;
                this.perc = perc;
        }
        var Income = function(id, type, description, value){
                this.ID = id;
                this.type = type;
                this.description = description;
                this.value = value;
        }
        var data = {
                allItems: {
                        inc: [],
                        exp: []
                },
                totals: {
                        inc: 0,
                        exp: 0,
                        total: 0,
                        percentage: 0
                }
        }
        var ID = 0;
         return {
                addItem: function(type, description, value){
                        var newItem;
                        var perc = 0;
                        
                                ID = data.allItems[type].length;
                        

                         if(type === 'inc'){
                                newItem = new Income(ID, type, description, value);
                         }else if(type === 'exp'){
                                if(data.totals.exp == 0){
                                        perc = 100;
                                }else{
                                        perc = (value / data.totals.exp ) * 100; 
                                }
                                
                                newItem = new Expense(ID, type, description, value, perc);
                         }
                         data.allItems[type].push(newItem);

                         return newItem;
                },
                countSums: function(){
                        var income = 0;
                        var expense = 0;
                        var total = 0;
                        var perc = 0;
                        var itemPerc = 0;
                        // INCOME
                        data.allItems.inc.forEach(function(elem){
                                income += elem.value;
                        })
                        data.totals.inc = income;
                        // EXPENSE
                        data.allItems.exp.forEach(function(elem){
                                expense += elem.value;

                        })
                        data.totals.exp = expense;

                        data.allItems.exp.forEach(function(elem){
                                elem.perc = (elem.value / expense) * 100;
                        })
                        total = income - expense;
                        data.totals.total = total;

                        if(income != 0){
                                perc = (expense / income) * 100;
                        }else{
                                perc = 0;
                        }
                        if(Number.isInteger(perc)){
                                data.totals.percentage = perc;
                        }else{
                                data.totals.percentage = perc.toFixed(1);
                        }

                        return data;
                },
                deleteItem: function(type, id){
                        var type;
                        if(type == 'income'){
                               type = 'inc'; 
                        }else if(type == 'expense'){
                                type = 'exp';
                        }
                        data.allItems[type].splice(id, 1);
                        data.allItems[type].forEach(function(elem){
                                if(id < elem.ID){
                                        elem.ID--;
                                }
                        })
                        
                },
                testing: function(){
                        return data;
                }
         }
})();


// UI CONTROLLER
var UIController = (function(){
        var DOMstrings = {
                addType: '.add__type',
                addDesk: '.add__description',
                addValue: '.add__value',
                deleteBtn: '.item__delete--btn'
        }
        return {
                getData: function(){
                        var type = document.querySelector(DOMstrings.addType);
                        var description = document.querySelector(DOMstrings.addDesk);
                        var value = document.querySelector(DOMstrings.addValue);
                        return {
                                type: type.value,
                                description: description.value,
                                value: parseFloat(value.value),
                        }
                },
                DOM: function(){
                        return DOMstrings;
                },
                postItem: function(obj){
                        var string, list;

                        if(obj.type === 'inc'){
                                string = '<div class="item clearfix" id="income-%ID%"><div class="item__description">%Description%</div><div class="right clearfix"><div class="item__value">+ %Value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                                list = document.querySelector('.income__list');
                        }else if(obj.type === 'exp'){
                                string = '<div class="item clearfix" id="expense-%ID%"><div class="item__description">%Description%</div><div class="right clearfix"><div class="item__value">- %Value%</div><div class="item__percentage">!perc!%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                                list = document.querySelector('.expenses__list');
                        }
                        string = string.replace('%Description%', obj.description);
                        string = string.replace('%Value%', obj.value);
                        string = string.replace('%ID%', obj.ID);
                        string = string.replace('!perc!', obj.perc);

                        list.insertAdjacentHTML("beforeend", string);
                }, 
                resetInputs: function(){
                        document.querySelector(DOMstrings.addDesk).value = '';
                        document.querySelector(DOMstrings.addValue).value = '';
                },

                updateSums: function(obj){
                        
                        // INCOME
                        document.querySelector('.budget__income--value').innerHTML = '+ ' + obj.totals.inc; 
                        // EXPENSE
                        document.querySelector('.budget__expenses--value').innerHTML = '- ' + obj.totals.exp; 
                        // TOTAL
                        if(obj.totals.total >= 0 ){
                                document.querySelector('.budget__value').innerHTML = '+ ' + obj.totals.total; 
                        }else{
                                document.querySelector('.budget__value').innerHTML = '- ' + Math.abs(obj.totals.total); 
                        }
                        // PERCENTAGE
                        document.querySelector('.budget__expenses--percentage').innerHTML = obj.totals.percentage + '%';
                        // ITEM PERCENTAGE

                        obj.allItems.exp.forEach(function(elem){
                                if(!Number.isInteger(elem.perc)){
                                        elem.perc = elem.perc.toFixed(1);
                                }
                                document.querySelector('#expense-' + elem.ID + ' .item__percentage').innerHTML = elem.perc + '%';
                        });

                        // ID

                        var inc_id = 0;
                        var exp_id = 0;
                        document.querySelectorAll('.item').forEach(function(elem){
                                if(elem.parentElement.className == 'income__list'){
                                        elem.id = 'income-' + inc_id;
                                        inc_id++;
                                }else if(elem.parentElement.className == 'expenses__list'){
                                        elem.id = 'expense-' + exp_id;
                                        exp_id++;
                                }
                        })
                        
                },
                deleteItem: function(id){
                        var card = document.getElementById(id);
                        card.parentNode.removeChild(card);
                }
        }
})();


// MAIN CONTROLLER
var controller = (function(budgetCtrl, UICtrl){
        var dom = UIController.DOM();
        document.querySelector('.add__btn').addEventListener('click', addCard);

        document.addEventListener('keypress', function(e){
                if(e.keyCode === 13 || e.which === 13){
                        addCard();
                }
        })

        function addCard(){
                // 1. get the data
                var input = UIController.getData();
                
                        if (input.description != '' && input.value != '' && !isNaN(input.value)){
                                document.querySelector(dom.addValue).style.borderColor = '#e7e7e7';
                                document.querySelector(dom.addDesk).style.borderColor = '#e7e7e7';

                                var newItem = budgetContoller.addItem(input.type, input.description, input.value);
                                console.log(newItem);

                                UIController.postItem(newItem);
                                
                                UIController.updateSums(budgetContoller.countSums());

                                UIController.resetInputs();

                        }else if(document.querySelector(dom.addDesk).value == '' && document.querySelector(UIController.DOM().addValue).value == ''){
                                document.querySelector(dom.addDesk).style.borderColor = 'red';
                                document.querySelector(dom.addValue).style.borderColor = 'red';
                        }else if(document.querySelector(dom.addDesk).value == ''){
                                document.querySelector(dom.addDesk).style.borderColor = 'red';
                                document.querySelector(dom.addValue).style.borderColor = '#e7e7e7';
                        }else if(document.querySelector(dom.addValue).value == ''){
                                document.querySelector(dom.addDesk).style.borderColor = '#e7e7e7';
                                document.querySelector(dom.addValue).style.borderColor = 'red';
                        }
        }
        document.addEventListener('click', function(e){
                console.log(e.target);
                var id = e.target.parentNode.parentNode.parentNode.parentNode.id;
                
                if(id){
                        var newId = id.split('-');
                        var type = newId[0];
                        var ctrlId = newId[1];
                        deleteCard(type, ctrlId, id);
                }
                
        })
        function deleteCard(type, ctrlId, id){
                UIController.deleteItem(id);
                budgetContoller.deleteItem(type, ctrlId);
                UIController.updateSums(budgetContoller.countSums());
        }

})(budgetContoller, UIController);
