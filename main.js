"use strict";

var snabbdom = require('snabbdom');
var patch = snabbdom.init([ // Init patch function with chosen modules
  require('snabbdom/modules/class').default, // makes it easy to toggle classes
  require('snabbdom/modules/props').default, // for setting properties on DOM elements
  require('snabbdom/modules/style').default, // handles styling on elements with support for animations
  require('snabbdom/modules/eventlisteners').default, // attaches event listeners
]);
var h = require('snabbdom/h').default; // helper function for creating vnodes

var seen = 0;

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function flip() {
  return getRandomInt(10) < 5;
}

function buildManualTable() {
  seen++;
  console.time("buildManualTable");
  var container = jQuery("#manual");
  var html = "<table><tobody>";
  for (var i=0; i<200; i++) {
    html += "<tr";
    if (flip()) {
      html += " style='display: none;'";
    }
    html += ">"
    for (var j=0; j<200; j++) {
      html += "<td>"+seen+"</td>";
    }
    html += "</tr>";
  }
  html += "</tbody></table>"
  container.empty();
  container.append(html);
  console.timeEnd("buildManualTable");
}

function buildVirtualDomTable(previous) {
  seen++;
  console.time("buildVirtualDomTable");
  var rows = [];
  for (var i=0; i<200; i++) {
    var cells = [];
    var hidden = flip();
    for (var j=0; j<200; j++) {
      var cell = h('td', {}, [""+seen]);
      cells.push(cell);
    }
    var style = hidden ? { style: {hidden: true} } : {};
    var row = h('tr', style, cells);
    rows.push(row);
  }
  var table = h('table', {}, [
    h('tbody', {}, rows)
  ]);
  if (previous) {
    patch(previous, table);
  } else {
    var container = document.getElementById("virtual");
    patch(container, table);
  }
  console.timeEnd("buildVirtualDomTable");
  return table;
}

jQuery(() => {
  setTimeout(() => {
    buildManualTable();
    setTimeout(() => {
      buildManualTable();
      setTimeout(() => {
        $("#manual").empty();
        var table = buildVirtualDomTable();
        setTimeout(() => {
          buildVirtualDomTable(table);
        }, 200);
      }, 200)
    }, 200);
  });
});

// var vnode = h('div#container.two.classes', {}, [
//   h('span', {style: {fontWeight: 'bold'}}, 'This is bold'),
//   ' and this is just normal text',
//   h('a', {props: {href: '/foo'}}, 'I\'ll take you places!')
// ]);
// // Patch into empty DOM element – this modifies the DOM as a side effect
// patch(container, vnode);

// var newVnode = h('div#container.two.classes', {on: {click: anotherEventHandler}}, [
//   h('span', {style: {fontWeight: 'normal', fontStyle: 'italic'}}, 'This is now italic type'),
//   ' and this is still just normal text',
//   h('a', {props: {href: '/bar'}}, 'I\'ll take you places!')
// ]);
// // Second `patch` invocation
// patch(vnode, newVnode); // Snabbdom efficiently updates the old view to the new state
