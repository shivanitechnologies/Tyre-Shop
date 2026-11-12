(function () {
  'use strict';

  const articles = {
    'tyre-size': {
      category: 'Tyres',
      title: 'How to read the numbers on your tyre sidewall',
      intro: 'Understanding the markings helps you compare tyres and confirm the size specified for your vehicle.',
      outline: ['Check your vehicle placard', 'Understand tyre markings', 'Confirm load and speed ratings'],
      sections: [
        ['Start with the vehicle specification', 'Before shopping, check the owner’s manual or vehicle placard for approved tyre sizes. A sidewall marking helps identify a tyre, but does not by itself confirm that it is suitable for every vehicle.'],
        ['Know what the size code describes', 'In a code such as 225/45 R17, the first number is nominal width in millimeters, the second is sidewall height ratio, R indicates radial construction, and the final number is wheel diameter in inches. Load and speed ratings also matter.'],
        ['Ask when the markings do not match', 'Do not assume a near match is acceptable. Confirm size, load rating, speed rating, and fitment requirements with a qualified tyre professional.']
      ]
    },
    'alignment-signs': {
      category: 'Alignment',
      title: 'Signs your wheel alignment may need checking',
      intro: 'A few driving and tyre-wear changes can be good reasons to schedule an inspection.',
      outline: ['Notice how the vehicle tracks', 'Look at the tread pattern', 'Check after suspension work'],
      sections: [
        ['Notice how the vehicle tracks', 'If the vehicle consistently pulls to one side on a level road, or the steering wheel sits off-center while driving straight, have the steering and tyres inspected. Road slope and tyre pressure can also affect how a vehicle tracks.'],
        ['Look at the tread pattern', 'Uneven wear across a tyre shoulder or between tyres can have several causes. An alignment measurement is one way to help identify the source, but suspension condition and pressure should also be checked.'],
        ['Check after suspension work', 'Alignment inspection is often recommended after steering or suspension components are replaced. Follow the vehicle manufacturer’s service guidance and ask for the measurement results.']
      ]
    },
    'monthly-check': {
      category: 'Safety',
      title: 'A simple monthly tyre safety check',
      intro: 'A short, regular inspection helps you notice pressure changes, visible damage, and uneven wear early.',
      outline: ['Check pressure when tyres are cool', 'Inspect tread and sidewalls', 'Get concerns checked promptly'],
      sections: [
        ['Check pressure when tyres are cool', 'Use the pressure listed on the vehicle placard or owner’s manual, not the maximum pressure printed on the tyre sidewall. Check all tyres, including the spare if your vehicle has one.'],
        ['Inspect tread and sidewalls', 'Look for cuts, bulges, embedded objects, cracks, or unusual wear. Do not remove an object from a tyre that may be holding air; seek professional help.'],
        ['Get concerns checked promptly', 'If a tyre loses pressure repeatedly, vibrates, or shows visible damage, avoid relying on a visual check alone. A qualified tyre professional can assess whether repair or replacement is appropriate.']
      ]
    }
  };

  function filterArticles() {
    const search = (document.getElementById('blogSearch')?.value || '').trim().toLowerCase();
    const category = document.getElementById('blogCategory')?.value || 'all';
    const cards = Array.from(document.querySelectorAll('.blog-card'));
    let visibleCount = 0;
    cards.forEach((card) => {
      const matchesCategory = category === 'all' || card.dataset.category === category;
      const matchesSearch = !search || card.textContent.toLowerCase().includes(search);
      const visible = matchesCategory && matchesSearch;
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });
    const emptyState = document.getElementById('blogEmptyState');
    if (emptyState) emptyState.hidden = visibleCount > 0;
  }

  function renderArticle() {
    const articleBody = document.getElementById('articleBody');
    if (!articleBody) return;
    const slug = new URLSearchParams(window.location.search).get('article') || 'tyre-size';
    const article = articles[slug] || articles['tyre-size'];
    const title = document.getElementById('articleTitle');
    const category = document.getElementById('articleCategory');
    const intro = document.getElementById('articleIntro');
    if (title) title.textContent = article.title;
    if (category) category.textContent = `${article.category} · TORQ guide`;
    if (intro) intro.textContent = article.intro;
    article.sections.forEach(([heading, paragraph]) => {
      const headingElement = document.createElement('h2');
      const paragraphElement = document.createElement('p');
      headingElement.textContent = heading;
      paragraphElement.textContent = paragraph;
      articleBody.append(headingElement, paragraphElement);
    });
    const outline = document.getElementById('articleOutline');
    if (outline) {
      article.outline.forEach((item) => {
        const listItem = document.createElement('li');
        listItem.textContent = item;
        outline.appendChild(listItem);
      });
    }
    document.title = `${article.title} | TORQ Blog`;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = article.intro;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const search = document.getElementById('blogSearch');
    const category = document.getElementById('blogCategory');
    if (search) search.addEventListener('input', filterArticles);
    if (category) category.addEventListener('change', filterArticles);
    filterArticles();
    renderArticle();
  });
})();
