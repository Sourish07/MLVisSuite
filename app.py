from io import BytesIO

from flask import Flask, request, jsonify, Response, render_template
import matplotlib.pyplot as plt, mpld3
from mpld3 import fig_to_html, plugins
import pandas as pd
import numpy as np

app = Flask(__name__)

X, y, fig, ax, w, line, scatter = None, None, None, None, None, None, None
converged = False

current_degree = 1
epsilon = 1e-4

x_min, x_max = -5, 5
y_min, y_max = -5, 5

temp = np.linspace(x_min, x_max + 1, 100).reshape(-1, 1)
line_x = np.hstack([np.ones_like(temp), temp])


@app.route('/')
def main():
    global X, y, fig, ax, w, line
    X = np.empty((0, 2))
    y = np.empty((0, 1))
    w = np.zeros((current_degree + 1, 1))

    fig, ax = plt.subplots()
    ax.set(xlim=(x_min, x_max), ylim=(y_min, y_max))
    ax.tick_params(axis='x', colors='red', direction='out', length=13, width=3)
    # ax.spines['left'].set_position("zero")
    # ax.spines['bottom'].set_position("zero")

    line = ax.plot(line_x[:, [1]], line_x @ w, color='b', linewidth=3)

    mpld3.plugins.clear(fig)
    plugins.connect(fig, plugins.MousePosition(fontsize=0))
    plugins.connect(fig, MoveAxis())
    return render_template("index.html", graph=fig_to_html(fig))


@app.route('/add_point', methods=['POST'])
def add_point():
    global X, y, fig, ax, w, converged, scatter

    converged = False

    data = request.get_json()
    X = np.vstack([X, [1, data['x']]])
    y = np.vstack([y, data['y']])

    if scatter is not None:
        scatter.remove()
    scatter = ax.scatter(X[:, [1]], y, color='r', s=10)
    return fig_to_html(fig)


@app.route('/grad_desc', methods=['POST'])
def gradient_descent():
    global X, y, fig, ax, w, line, converged, line_x, current_degree

    if X.shape[0] != 0 and not converged:
        new_degree = int(request.get_json()['degree'])
        if new_degree != current_degree:
            x_vals = []
            line_x_vals = []
            for i in range(new_degree + 1):
                x_vals.append(X[:, [1]] ** i)
                line_x_vals.append(line_x[:, [1]] ** i)

            X = np.hstack(x_vals)
            line_x = np.hstack(line_x_vals)
            w = np.zeros((new_degree + 1, 1))
            current_degree = new_degree

        tau = (1 / (np.linalg.norm(X, ord=2) ** 2)) * 0.999
        for i in range(request.get_json()['num_of_iterations']):
            if converged:
                break
            z = w - tau * X.T @ (X @ w - y)
            if np.linalg.norm(w - z) < epsilon:
                converged = True
            w = z

        line.pop().remove()
        line = ax.plot(line_x[:, [1]], line_x @ w, color='b', linewidth=3)
    return jsonify({'graph': fig_to_html(fig),
                    'converged': converged,
                    'cost': round(cost(), 2),
                    'intercept': round(w[0].item(), 4),
                    'slope': round(w[1].item(), 4)})


def cost():
    return np.sum((X @ w - y) ** 2)


class MoveAxis(plugins.PluginBase):
    JAVASCRIPT = """
        mpld3.register_plugin("moveaxis", MoveAxis);
        MoveAxis.prototype = Object.create(mpld3.Plugin.prototype);
        MoveAxis.prototype.constructor = MoveAxis;
        function MoveAxis(fig, props){
            mpld3.Plugin.call(this, fig, props);
        };

        MoveAxis.prototype.draw = function(){
            document.getElementsByClassName('mpld3-xaxis')[0].setAttribute('transform', 'translate(0,184.8)')
            document.getElementsByClassName('mpld3-yaxis')[0].setAttribute('transform', 'translate(248,0)')
            $("g[transform='translate(248.5,0)']").text("")
            $("g[transform='translate(0,185.3)']").text("")
        }
        """

    def __init__(self):
        self.dict_ = {"type": "moveaxis"}


if __name__ == '__main__':
    app.run(debug=True)
