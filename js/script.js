document.addEventListener('DOMContentLoaded', () => {
    const problemInput = document.getElementById('problemInput');
    const addButton = document.getElementById('addButton');
    const problemsList = document.getElementById('problemsList');
    const emptyState = document.getElementById('emptyState');
    const problemCount = document.getElementById('problemCount');
    const problemLevel = document.getElementById('problemLevel');
    const welcomeModal = document.getElementById('welcomeModal');
    const closeModal = document.getElementById('closeModal');
    const currentDate = document.getElementById('currentDate');

    let problems = JSON.parse(localStorage.getItem('problems')) || [];

    currentDate.textContent = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    // Show welcome modal
    if (!localStorage.getItem('welcomeModalShown')) {
        welcomeModal.style.display = 'flex';
        localStorage.setItem('welcomeModalShown', 'true');
    }

    closeModal.addEventListener('click', () => {
        welcomeModal.style.display = 'none';
    });

    function saveProblemsList() {
        localStorage.setItem('problems', JSON.stringify(problems));
    }

    function updateProblemCount() {
        const count = problems.length;
        problemCount.textContent = count;
        
        let level;
        if (count === 0) level = 'None';
        else if (count <= 2) level = 'Low';
        else if (count <= 4) level = 'Medium';
        else level = 'High';

        problemLevel.textContent = level;
        problemLevel.className = `level-${level.toLowerCase()}`;
        
        emptyState.style.display = count === 0 ? 'block' : 'none';
    }

    function addProblem(text) {
        const problem = {
            id: Date.now().toString(),
            text: text
        };
        
        problems.push(problem);
        renderProblem(problem);
        updateProblemCount();
        saveProblemsList();
    }

    function renderProblem(problem) {
        const div = document.createElement('div');
        div.className = 'problem-item';
        div.draggable = true;
        div.dataset.id = problem.id;
        
        div.innerHTML = `
            <span>${problem.text}</span>
            <button class="delete-btn" aria-label="Delete problem">
                <i class="ti ti-trash"></i>
            </button>
        `;
        
        const deleteBtn = div.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => deleteProblem(problem.id));
        
        div.addEventListener('dragstart', () => div.classList.add('dragging'));
        div.addEventListener('dragend', () => div.classList.remove('dragging'));
        
        problemsList.appendChild(div);
        
    }

    function deleteProblem(id) {
        problems = problems.filter(p => p.id !== id);
        document.querySelector(`[data-id="${id}"]`).remove();
        updateProblemCount();
        saveProblemsList();
    }

    function renderAllProblems() {
        problemsList.innerHTML = '';
        problems.forEach(renderProblem);
        updateProblemCount();
    }

    addButton.addEventListener('click', () => {
        const text = problemInput.value.trim();
        if (text) {
            addProblem(text);
            problemInput.value = '';
        }
    });

    problemInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const text = problemInput.value.trim();
            if (text) {
                addProblem(text);
                problemInput.value = '';
            }
        }
    });

    problemsList.addEventListener('dragover', e => {
        e.preventDefault();
        const draggingItem = document.querySelector('.dragging');
        const siblings = [...problemsList.querySelectorAll('.problem-item:not(.dragging)')];
        
        const nextSibling = siblings.find(sibling => {
            const box = sibling.getBoundingClientRect();
            const offset = e.clientY - box.top - box.height / 2;
            return offset < 0;
        });
        
        problemsList.insertBefore(draggingItem, nextSibling);
    });

    problemsList.addEventListener('dragend', () => {
        const newOrder = [...problemsList.querySelectorAll('.problem-item')];
        problems = newOrder.map(item => {
            const id = item.dataset.id;
            return problems.find(p => p.id === id);
        });
        saveProblemsList();
    });

    renderAllProblems();
    feather.replace(); 
});