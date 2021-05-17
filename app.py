from io import BytesIO

from flask import Flask, request, jsonify, Response, render_template
import matplotlib.pyplot as plt, mpld3
from mpld3 import fig_to_html, plugins
import pandas as pd
import numpy as np

app = Flask(__name__)

X, y, w = np.array([]), np.array([]), np.array([])
fig, ax, line, scatter, gd_line_x = None, None, None, None, None
df = None
current_degree = None

is_converged = False
is_new_point_added = True

epsilon = 1e-4

x_min, x_max = -15, 15
y_min, y_max = -15, 15

og_line_x_vals = np.linspace(x_min, x_max + 1, 100).reshape(-1, 1)


@app.route('/')
def main():
    return render_template("index.html")

#### LINEAR REGRESSION ####
@app.route('/linreg')
def linear_regression():
    global X, y, fig, ax, w, line, current_degree, df
    df = pd.DataFrame(columns=['x', 'y'], dtype=np.float)

    fig, ax = plt.subplots()
    ax.set(xlim=(x_min, x_max), ylim=(y_min, y_max))
    line = ax.plot(og_line_x_vals, np.zeros_like(og_line_x_vals), color='b', linewidth=3)

    mpld3.plugins.clear(fig)
    plugins.connect(fig, plugins.MousePosition(fontsize=0))
    plugins.connect(fig, MoveAxis())
    return render_template("linreg.html", graph=get_html_fig())


@app.route('/linreg-add-point', methods=['POST'])
def add_point():
    global is_converged, is_new_point_added, scatter

    is_converged = False
    is_new_point_added = True
    data = request.get_json()

    df.loc[len(df)] = [data['x'], data['y']]

    if scatter is not None:
        scatter.remove()
    scatter = ax.scatter(df['x'], df['y'], color='r', s=10)
    return get_html_fig()


@app.route('/linreg-grad-desc', methods=['POST'])
def gradient_descent():
    #global X, y, fig, ax, w, line, is_converged, current_degree, is_new_point_added
    global current_degree, is_new_point_added, X, y, w, is_converged, line, gd_line_x
    if len(df) != 0:
        new_degree = int(request.get_json()['degree'])
        if new_degree != current_degree or is_new_point_added:
            x_vals = []
            line_x_vals = []
            for i in range(new_degree + 1):
                x_vals.append(df[['x']].to_numpy() ** i)
                line_x_vals.append(og_line_x_vals ** i)
            X = np.hstack(x_vals)
            y = df['y'].to_numpy().reshape((-1, 1))
            gd_line_x = np.hstack(line_x_vals)

            w = np.zeros((new_degree + 1, 1))
            current_degree = new_degree
            is_converged = False
            is_new_point_added = False

        if not is_converged:
            tau = (1 / (np.linalg.norm(X, ord=2) ** 2)) * 0.999
            for i in range(request.get_json()['num_of_iterations']):
                if is_converged:
                    break
                z = w - tau * X.T @ (X @ w - y)
                if np.linalg.norm(w - z) < epsilon:
                    is_converged = True
                w = z

            line.pop().remove()
            line = ax.plot(gd_line_x[:, [1]], gd_line_x @ w, color='b', linewidth=3)

    w_list = [round(i.item(), 2) for i in w]

    if len(df) == 0:
        converged_text = "Click to add data!"
    elif is_converged:
        converged_text = "Line has converged!"
    else:
        converged_text = "Line has not converged!"
    return jsonify({'graph': get_html_fig(),
                    'converged': converged_text,
                    'cost': round(cost(), 2),
                    'coefficients': w_list})
                    # 'intercept': round(w[0].item(), 4),
                    # 'slope': round(w[1].item(), 4))


def cost():
    return np.sum((X @ w - y) ** 2)


def get_html_fig():
    return fig_to_html(fig, figid="figure")


@app.route('/logreg')
def logistic_regression():
    return "Logistic Regression"


@app.route('/kmeans')
def k_means():
    return "K-Means"


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
            $("tspan[dy='11.015625']").attr('dy', "13.015625")
        }
        """

    def __init__(self):
        self.dict_ = {"type": "moveaxis"}


if __name__ == '__main__':
    app.run(debug=True)
